import os
import httpx
import asyncio
import json
import re
import logging
from datetime import datetime, timedelta
from collections import Counter
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from .state import ReviewState

logger = logging.getLogger(__name__)

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    logger.warning("GROQ_API_KEY is missing! LLM calls will fail.")

# Set up the Groq AI brain using Llama 3.3
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2, timeout=30)

async def fetch_graphql_data(username: str, headers: dict):
    query = """
    query($username: String!) {
      user(login: $username) {
        name
        bio
        followers { totalCount }
        totalRepositories: repositories { totalCount }
        createdAt
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
        repositories(first: 50, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            name
            description
            stargazerCount
            forkCount
            updatedAt
            primaryLanguage { name }
            languages(first: 5) {
              edges {
                size
                node { name }
              }
            }
          }
        }
      }
    }
    """
    url = "https://api.github.com/graphql"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, json={"query": query, "variables": {"username": username}}, headers=headers, timeout=15.0)
            if resp.status_code == 200:
                data = resp.json()
                if "errors" in data:
                    logger.error(f"GRAPHQL ERRORS for {username}: {data['errors']}")
                user_data = data.get("data", {})
                return user_data.get("user") if user_data else None
            return None
        except Exception as e:
            logger.error(f"GRAPHQL EXCEPTION for {username}: {str(e)}", exc_info=True)
            return None

def calculate_streaks(days):
    if not days:
        return 0, 0
    
    # Sort days by date
    sorted_days = sorted(days, key=lambda x: x['date'], reverse=True)
    
    current_streak = 0
    longest_streak = 0
    temp_streak = 0
    
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    # Check current streak
    can_continue_current = True
    for day in sorted_days:
        d = datetime.strptime(day['date'], "%Y-%m-%d").date()
        if day['count'] > 0:
            current_streak += 1
        elif d == today:
            continue # Skip today if 0 but check yesterday
        else:
            break
            
    # Longest streak
    for day in reversed(sorted_days):
        if day['count'] > 0:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 0
            
    return current_streak, longest_streak

async def extract_github_data(state: ReviewState):
    username = state["username"]
    github_token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"Bearer {github_token}"} if github_token else {}
    
    try:
        # 1. Unified GraphQL call
        gql_data = await fetch_graphql_data(username, headers)
        
        if not gql_data:
             logger.error(f"Failed to fetch GitHub data for username '{username}'.")
             return {"github_data": {"error": "User Not Found or API failure", "status": 404}}

        # 2. Extract Profile
        user_profile = {
            "name": gql_data.get("name") or username,
            "followers": gql_data.get("followers", {}).get("totalCount", 0),
            "public_repos": gql_data.get("totalRepositories", {}).get("totalCount", 0),
            "created_at": gql_data.get("createdAt", ""),
            "bio": gql_data.get("bio") or "No bio provided"
        }
        logger.info(f"Successfully fetched GitHub data for '{username}'. Public Repos: {user_profile['public_repos']}")

        # 3. Process Contributions
        cal = gql_data.get("contributionsCollection", {}).get("contributionCalendar", {})
        days_flat = []
        for week in cal.get("weeks", []):
            for day in week.get("contributionDays", []):
                days_flat.append({
                    "date": day["date"],
                    "count": day["contributionCount"],
                    "color": day["color"]
                })
        
        c_streak, l_streak = calculate_streaks(days_flat)
        contribution_heatmap = {
            "total": cal.get("totalContributions", 0),
            "streak_current": c_streak,
            "streak_longest": l_streak,
            "days": days_flat
        }

        # 4. Process Repos
        lang_stats = Counter()
        top_repos = []
        total_stars = 0
        repo_nodes = gql_data.get("repositories", {}).get("nodes", [])
        
        for repo in repo_nodes:
            if not repo:
                continue
                
            # Stats for languages
            languages_node = repo.get("languages") or {}
            for edge in languages_node.get("edges") or []:
                if edge and edge.get("node"):
                    lang_name = edge.get("node").get("name")
                    if lang_name:
                        lang_stats[lang_name] += edge.get("size", 0)
            
            # Repo metrics
            stars = repo.get("stargazerCount", 0)
            total_stars += stars
            forks = repo.get("forkCount", 0)
            updated_at_str = repo.get("updatedAt")
            
            # Simple scoring
            now = datetime.now()
            updated_at = datetime.strptime(updated_at_str, "%Y-%m-%dT%H:%M:%SZ") if updated_at_str else now
            days_since_update = (now - updated_at).days
            
            score = (min(stars, 100) * 0.5) + (min(forks, 50) * 0.3) + (max(0, 10 - (days_since_update // 30)) * 0.2)
            
            primary_lang_node = repo.get("primaryLanguage") or {}
            
            top_repos.append({
                "name": repo.get("name"),
                "description": repo.get("description") or "No description provided",
                "stars": stars,
                "forks": forks,
                "language": primary_lang_node.get("name") or "Unknown",
                "updated_at": updated_at_str,
                "score": round(score, 1)
            })

        top_repos.sort(key=lambda x: x["score"], reverse=True)
        final_top_repos = top_repos[:6]
        
        total_bytes = sum(lang_stats.values())
        lang_dist = []
        if total_bytes > 0:
            lang_dist = [
                {"name": name, "value": round((size / total_bytes) * 100, 1)}
                for name, size in lang_stats.most_common(10)
            ]

        metrics = {
            "total_stars": total_stars,
            "top_languages": [l for l, _ in lang_stats.most_common(3)],
            "analyzed_count": user_profile["public_repos"],
            "contribution_heatmap": contribution_heatmap,
            "language_distribution": lang_dist
        }

        return {
            "github_data": final_top_repos,
            "user_profile": user_profile,
            "metrics": metrics
        }
            
    except Exception as e:
        logger.error(f"CRITICAL ERROR in extract_github_data: {e}", exc_info=True)
        return {"github_data": {"error": f"An unexpected error occurred: {str(e)}", "status": 500}}

async def code_mentor_review(state: ReviewState):
    username = state["username"]
    repos = state.get("github_data", [])
    
    # If GitHub fetch failed, skip AI review and just bubble up the state
    if isinstance(repos, dict) and "error" in repos:
        logger.warning(f"Skipping AI review for {username} due to prior GitHub fetch error.")
        return {"feedback": {}}
        
    metrics = state.get("metrics", {})
    
    # Prune for AI efficiency limit to top 5
    pruned_repos = []
    for r in repos[:5]:
        pruned_repos.append({
            "name": r.get("name"),
            "description": r.get("description"),
            "stars": r.get("stars"),
            "language": r.get("language")
        })

    context = f"Username: {username}\nTotal Stars: {metrics.get('total_stars', 0)}\nContributions: {metrics.get('contribution_heatmap', {}).get('total', 0)}"

    prompt = f"""Recruiter Review for {username}. Context:
{context}

REPOSITORIES:
{json.dumps(pruned_repos, indent=2)}

Return STRICT JSON:
{{
  "projects": [{{
    "name": "",
    "summary": "punchy",
    "tech_stack": [],
    "project_strength": "Strong | Intermediate",
    "reasoning": "brief"
  }}],
  "top_projects": [{{"name": "", "reasoning": ""}}],
  "strengths": [],
  "weaknesses": [],
  "overall_portfolio_assessment": {{
    "level": "Ready to be Hired | Needs Some Improvement | Early Stage",
    "strength_focus": "specialization",
    "hireability": "Hireable | Borderline",
    "summary": "Impactful verdict"
  }}
}}"""

    logger.info(f"Starting LLM analysis for {username} (Prompt Length: {len(prompt)} chars, Repos included: {len(pruned_repos)})")
    
    try:
        response = await llm.ainvoke(prompt)
        content = response.content.replace('```json', '').replace('```', '').strip()
        feedback = json.loads(content)
        logger.info(f"Successfully generated LLM analysis for {username}")
        return {"feedback": feedback}
    except Exception as e:
        logger.error(f"LLM Error/Timeout in code_mentor_review for {username}: {e}", exc_info=True)
        # Robust Fallback Response
        fallback_projects = [{"name": r.get("name", "Unknown"), "summary": r.get("description") or "No description", "tech_stack": [r.get("language") or "Unknown"], "project_strength": "Intermediate", "reasoning": "Basic metrics extracted"} for r in pruned_repos]
        return {
            "feedback": {
                "fallback": True,
                "message": "AI analysis unavailable, showing basic GitHub insights",
                "projects": fallback_projects,
                "top_projects": [],
                "strengths": ["GitHub Stats Successfully Collected"],
                "weaknesses": ["Deep AI Analysis Temporarily Unavailable"],
                "overall_portfolio_assessment": {
                    "level": "Average",
                    "strength_focus": "Basic Activity",
                    "hireability": "Borderline",
                    "summary": "AI processing timed out or failed. Displaying raw GitHub repository data instead."
                }
            }
        }
