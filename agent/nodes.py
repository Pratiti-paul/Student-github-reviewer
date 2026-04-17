import os
import requests
import json
import re
from datetime import datetime, timedelta
from collections import Counter
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from .state import ReviewState

load_dotenv()

# Set up the Groq AI brain using Llama 3.1
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.0)

def fetch_graphql_data(username: str, headers: dict):
    query = """
    query($username: String!) {
      user(login: $username) {
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
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
          nodes {
            languages(first: 10) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
    """
    url = "https://api.github.com/graphql"
    try:
        resp = requests.post(url, json={"query": query, "variables": {"username": username}}, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            if "errors" in data:
                print(f"GRAPHQL ERRORS for {username}: {data['errors']}")
            return data.get("data", {}).get("user", {})
        else:
            print(f"GRAPHQL ERROR for {username}: Status {resp.status_code}, Body: {resp.text}")
    except Exception as e:
        print(f"GRAPHQL EXCEPTION for {username}: {str(e)}")
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

def extract_github_data(state: ReviewState):
    username = state["username"]
    github_token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"Bearer {github_token}"} if github_token else {}
    
    try:
        # 1. Fetch User Profile Metadata (REST remains best for this)
        user_url = f"https://api.github.com/users/{username}"
        user_resp = requests.get(user_url, headers=headers)
        user_profile = {"name": username, "followers": 0, "public_repos": 0, "created_at": "", "bio": "No bio provided"}
        
        if user_resp.status_code == 200:
            u = user_resp.json()
            user_profile = {
                "name": u.get("name") or username,
                "followers": u.get("followers", 0),
                "public_repos": u.get("public_repos", 0),
                "created_at": u.get("created_at", ""),
                "bio": u.get("bio") or "No bio provided"
            }

        # 2. GraphQL for Deep Intelligence (Heatmap + Exact Languages)
        gql_data = fetch_graphql_data(username, headers)
        
        contribution_heatmap = {"total": 0, "streak_current": 0, "streak_longest": 0, "days": []}
        language_distribution = []
        
        if gql_data:
            # A. Process Heatmap
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
            
            # B. Process Languages (Aggregated across all repos)
            lang_stats = Counter()
            repos_nodes = gql_data.get("repositories", {}).get("nodes", [])
            for repo in repos_nodes:
                for edge in repo.get("languages", {}).get("edges", []):
                    lang_name = edge.get("node", {}).get("name")
                    lang_size = edge.get("size", 0)
                    lang_stats[lang_name] += lang_size
            
            total_bytes = sum(lang_stats.values())
            if total_bytes > 0:
                language_distribution = [
                    {"name": name, "value": round((size / total_bytes) * 100, 1)}
                    for name, size in lang_stats.most_common(10)
                ]

        # 3. Fetch Top Repos (REST remains reliable for scoring logic)
        repos_url = f"https://api.github.com/users/{username}/repos?per_page=100"
        repos_resp = requests.get(repos_url, headers=headers)
        
        top_repos = []
        metrics = {"total_stars": 0, "top_languages": [], "activity_level": "Medium", "analyzed_count": 0}
        
        if user_resp.status_code == 200 and repos_resp.status_code == 200:
            all_repos = repos_resp.json()
            metrics["analyzed_count"] = len(all_repos)
            metrics["total_stars"] = sum(r.get("stargazers_count", 0) for r in all_repos)
            
            original_repos = [r for r in all_repos if not r.get("fork", False)]
            
            def calculate_repo_score(repo):
                # Using existing robust scoring logic
                stars = repo.get("stargazers_count", 0)
                forks = repo.get("forks_count", 0)
                now = datetime.now()
                updated_at_str = repo.get("updated_at")
                updated_at = datetime.strptime(updated_at_str, "%Y-%m-%dT%H:%M:%SZ") if updated_at_str else now
                days_since_update = (now - updated_at).days
                
                recency_pts = 10 if days_since_update < 30 else (7 if days_since_update < 90 else (4 if days_since_update < 365 else 1))
                
                desc = repo.get("description") or ""
                desc_pts = 10 if len(desc.strip()) > 20 else (5 if len(desc.strip()) > 0 else 0)
                
                base_score = (min(stars, 100) * 0.4) + (min(forks, 50) * 0.2) + (recency_pts * 0.2) + (desc_pts * 0.2)
                
                if stars > 50: reason = "Significant community trust and engagement"
                elif recency_pts == 10: reason = "Highly active project with recent updates"
                else: reason = "Original project with clear scope"
                
                return base_score, reason

            scored_repos = []
            for r in original_repos:
                score, reason = calculate_repo_score(r)
                scored_repos.append({
                    "name": r.get("name") or "Unnamed",
                    "description": r.get("description") or "No description provided",
                    "stars": r.get("stargazers_count") or 0,
                    "forks": r.get("forks_count") or 0,
                    "language": r.get("language") or "Unknown",
                    "updated_at": r.get("updated_at") or "",
                    "score": round(score, 1),
                    "reason": reason
                })
            
            scored_repos.sort(key=lambda x: x["score"], reverse=True)
            top_repos = scored_repos[:10]
            
            langs = [r.get("language") for r in all_repos if r.get("language")]
            metrics["top_languages"] = [l for l, _ in Counter(langs).most_common(3)]
            metrics["contribution_heatmap"] = contribution_heatmap
            metrics["language_distribution"] = language_distribution
                    
        return {
            "github_data": top_repos,
            "user_profile": user_profile,
            "metrics": metrics
        }
            
    except Exception as e:
        return {"github_data": {"error": f"An unexpected error occurred: {str(e)}", "status": 500}}

def code_mentor_review(state: ReviewState):
    # Same feedback logic but with more metrics for the AI to consider
    username = state["username"]
    repos = state.get("github_data", [])
    profile = state.get("user_profile", {})
    metrics = state.get("metrics", {})
    
    context = f"""DEVELOPER PROFILE:
- Username: {username}
- Total Repo Analyzed: {metrics.get('analyzed_count', 0)}
- Total Stars: {metrics.get('total_stars', 0)}
- Top Languages: {', '.join(metrics.get('top_languages', []))}
- Yearly Contributions: {metrics.get('contribution_heatmap', {}).get('total', 0)}
- Current Streak: {metrics.get('contribution_heatmap', {}).get('streak_current', 0)} days"""

    prompt = f"""You are a senior software engineer and hiring manager.
Analyze this GitHub developer portfolio context:
{context}

REPOSITORIES:
{json.dumps(repos, indent=2)}

Return STRICT JSON:
{{
  "projects": [{{
    "name": "",
    "summary": "",
    "tech_stack": [],
    "project_strength": "Strong | Intermediate | Weak",
    "reasoning": ""
  }}],
  "top_projects": [{{"name": "", "reasoning": ""}}],
  "strengths": [],
  "weaknesses": [],
  "missing_skills": [],
  "overall_portfolio_assessment": {{
    "level": "Strong | Good | Average | Needs Improvement",
    "hireability": "Hireable | Borderline | Not Ready",
    "summary": ""
  }}
}}"""

    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        content = response.content.strip()
        match = re.search(r'```(?:json)?\s*(.*?)\s*```', content, re.DOTALL)
        clean_content = match.group(1) if match else content
        parsed_feedback = json.loads(clean_content.strip())
    except:
        parsed_feedback = {"projects": [], "top_projects": [], "strengths": [], "weaknesses": ["Parse error"], "missing_skills": [], "overall_portfolio_assessment": {"level": "Average", "hireability": "Borderline", "summary": "Error parsing feedback."}}

    return {"feedback": parsed_feedback}
