import os
import requests
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from .state import ReviewState

load_dotenv()

# Set up the Groq AI brain using Llama 3.1
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)

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
            
            # Sort by stargazers_count descending
            repos_data.sort(key=lambda x: x.get("stargazers_count", 0) or 0, reverse=True)
            top_repos = repos_data[:10]
            
            detailed_repos = []
            languages_set = set()
            for repo in top_repos:
                detailed_repos.append({
                    "name": repo.get("name"),
                    "description": repo.get("description"),
                    "stargazers_count": repo.get("stargazers_count"),
                    "forks_count": repo.get("forks_count"),
                    "language": repo.get("language"),
                    "updated_at": repo.get("updated_at")
                })
                if repo.get("language"):
                    languages_set.add(repo.get("language"))
                    
            real_data = {
                "top_repositories": detailed_repos,
                "primary_languages": list(languages_set),
                "public_repos_count": user_resp.json().get("public_repos", 0)
            }
            return {"github_data": real_data}
        else:
            return {"github_data": {"error": f"API Error: User {username} not found."}}
            
    except Exception as e:
        return {"github_data": {"error": str(e)}}

def code_mentor_review(state: ReviewState):
    username = state["username"]
    data = state.get("github_data", {})
    
    prompt = f"""
    You are a senior software engineer and hiring manager.
    
    You are given detailed GitHub repository data of a developer.
    
    Analyze EACH repository deeply.
    
    For every repo:
    * Explain what the project likely does (based on name + description)
    * Identify tech stack
    * Judge project quality (beginner / intermediate / strong)
    * Give 1 specific improvement
    
    Then provide:
    1. Top 3 strongest projects (with reasoning)
    2. Technical strengths (based on actual repos)
    3. Weaknesses (based on missing patterns)
    4. Missing skills (be specific: backend, APIs, deployment, etc.)
    5. Hireability level (with reasoning)
    
    Be VERY specific. Avoid generic statements.
    
    Input:
    {json.dumps(data, indent=2)}
    
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
