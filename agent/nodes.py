import os
import requests
import json
import re
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from .state import ReviewState

load_dotenv()

# Set up the Groq AI brain using Llama 3.1
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.0)

def extract_github_data(state: ReviewState):
    username = state["username"]
    github_token = os.getenv("GITHUB_TOKEN")
    headers = {"Authorization": f"Bearer {github_token}"} if github_token else {}
    
    try:
        user_url = f"https://api.github.com/users/{username}"
        user_resp = requests.get(user_url, headers=headers)
        
        repos_url = f"https://api.github.com/users/{username}/repos?per_page=100"
        repos_resp = requests.get(repos_url, headers=headers)
        
        if user_resp.status_code == 200 and repos_resp.status_code == 200:
            repos_data = repos_resp.json()
            
            # Sort by stargazers_count descending and updated_at descending
            repos_data.sort(key=lambda x: (x.get("stargazers_count") or 0, x.get("updated_at") or ""), reverse=True)
            top_repos = repos_data[:10]
            
            detailed_repos = []
            for repo in top_repos:
                detailed_repos.append({
                    "name": repo.get("name") or "",
                    "description": repo.get("description") or "",
                    "stars": repo.get("stargazers_count") or 0,
                    "forks": repo.get("forks_count") or 0,
                    "language": repo.get("language") or "",
                    "updated_at": repo.get("updated_at") or ""
                })
                    
            return {"github_data": detailed_repos}
        else:
            return {"github_data": {"error": f"API Error: User {username} not found."}}
            
    except Exception as e:
        return {"github_data": {"error": str(e)}}

def code_mentor_review(state: ReviewState):
    username = state["username"]
    repos = state.get("github_data", [])
    context = f"GitHub Username: {username}"
    
    prompt = f"""You are a senior software engineer and hiring manager conducting a portfolio review.

DEVELOPER CONTEXT:
{context}

REPOSITORIES TO ANALYZE (exactly {len(repos)} repos):
{json.dumps(repos, indent=2)}

QUALITY RUBRIC (use this strictly):
- Beginner: no README, single file, no structure, tutorial/copy-paste level
- Intermediate: has README, organized folders, some abstraction, no tests or CI
- Strong: README + tests or CI/CD, clear architecture, non-trivial original logic

STRICT RULES:
- Base ALL analysis ONLY on the provided repository data
- If description is missing, say "No description provided" — do NOT invent purpose
- Be specific: reference actual repo names, languages, and topics
- Never use phrases like "diverse tech stack" or "strong foundation"
- Same input must always produce same output

TASKS:
1. For EACH repository: summarize purpose (from description/topics only), identify tech stack, evaluate quality using the rubric above, give 1 specific actionable improvement
2. Identify top 3 strongest projects with reasoning tied to specific signals
3. List technical strengths as patterns you see across multiple repos
4. List concrete weaknesses (e.g. "0 of 10 repos have tests")
5. List missing skills based on gaps in the stack
6. Assess hireability with role fit and confidence level
7. Flag any red flags honestly

Return STRICT JSON only, no markdown, no explanation outside JSON:
{{
  "projects": [{{
    "name": "",
    "summary": "",
    "tech_stack": [],
    "quality": "Beginner | Intermediate | Strong",
    "improvement": ""
  }}],
  "top_projects": [{{
    "name": "",
    "reasoning": ""
  }}],
  "strengths": [],
  "weaknesses": [],
  "missing_skills": [],
  "red_flags": [],
  "hireability": {{
    "level": "Junior | Mid | Senior",
    "confidence": "Low | Medium | High",
    "reasoning": "",
    "suitable_roles": [],
    "not_suitable_for": []
  }}
}}"""

    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        content = response.content.strip()
        
        # Extract JSON using regex to handle extra preamble or postamble
        match = re.search(r'```(?:json)?\s*(.*?)\s*```', content, re.DOTALL)
        if match:
            clean_content = match.group(1)
        else:
            # Fallback if no markdown blocks are used
            clean_content = content
            
        parsed_feedback = json.loads(clean_content.strip())
    except json.JSONDecodeError as e:
        print("JSON DECODE ERROR:", e)
        print("FAILED ON CONTENT:", content)
        # Fallback if malformed
        parsed_feedback = {
            "projects": [],
            "top_projects": [],
            "strengths": [],
            "weaknesses": ["Failed to parse AI response. Please try again."],
            "missing_skills": [],
            "red_flags": [],
            "hireability": {
                "level": "Unknown",
                "confidence": "Low",
                "reasoning": "Parse failure.",
                "suitable_roles": [],
                "not_suitable_for": []
            }
        }

    return {"feedback": parsed_feedback}
