import os
import requests
import json
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
    data = state.get("github_data", {})
    
    prompt = f"""You are a senior software engineer and hiring manager.

You are given EXACTLY 10 GitHub repositories of a developer (already filtered and sorted).

STRICT RULES:

* Do NOT generate random or vague responses
* Base ALL insights ONLY on provided repositories
* Be deterministic (same input = same output)
* Avoid generic phrases like 'diverse tech stack'

TASK:

1. For EACH repository:

   * Explain what the project likely does
   * Identify tech stack
   * Evaluate quality (Beginner / Intermediate / Strong)
   * Give 1 specific improvement

2. Then provide:

   * Top 3 strongest projects (with reasoning)
   * Technical strengths (based on patterns across repos)
   * Weaknesses (clear gaps)
   * Missing skills
   * Final hireability level (with justification)

Return STRICT JSON:
{{
"projects": [
{{
"name": "",
"summary": "",
"tech_stack": [],
"quality": "",
"improvement": ""
}}
],
"top_projects": [],
"strengths": [],
"weaknesses": [],
"missing_skills": [],
"hireability": ""
}}

Data:
{json.dumps(data, indent=2)}
"""

    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        content = response.content.strip()
        # Handle cases where LLM returns output in a markdown block
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        parsed_feedback = json.loads(content.strip())
    except json.JSONDecodeError:
        # Fallback if malformed
        parsed_feedback = {
            "projects": [],
            "top_projects": [],
            "strengths": [],
            "weaknesses": ["Failed to parse AI response. Please try again."],
            "missing_skills": [],
            "hireability": "Unknown"
        }

    return {"feedback": parsed_feedback}
