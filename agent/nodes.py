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
        
        repos_url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=5"
        repos_resp = requests.get(repos_url, headers=headers)
        
        if user_resp.status_code == 200 and repos_resp.status_code == 200:
            repos_data = repos_resp.json()
            repo_names = [repo["name"] for repo in repos_data]
            languages = list(set([repo["language"] for repo in repos_data if repo["language"]]))
            
            real_data = {
                "recent_repos": repo_names,
                "primary_languages": languages,
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
    You are a Senior Software Engineer and Hiring Manager evaluating a candidate's GitHub portfolio.
    Analyze the GitHub portfolio data for '{username}'.
    
    Data: {json.dumps(data, indent=2)}
    
    You MUST analyze the portfolio and generate deep insights on:
    1. Portfolio Strength (Quality/diversity of projects, modern tech, real-world impact)
    2. Technical Skills (Languages/tech stack, dominant areas)
    3. Activity & Consistency
    4. Project Quality Signals (Based on recent repos, overall count, etc.)
    5. Portfolio Gaps (Missing skills, areas to improve)
    6. Hireability Evaluation (Beginner/Intermediate/Advanced; Not Ready/Intern-ready/Job-ready)

    Return ONLY a raw, valid JSON object with the following exact keys and types. Do NOT include markdown blocks, backticks, or any conversational text.
    {{
        "score": 0.0,
        "level": "Beginner/Intermediate/Advanced",
        "skills": [],
        "strengths": [],
        "weaknesses": [],
        "suggestions": [],
        "missing_skills": [],
        "activity_insights": [],
        "project_insights": [],
        "hireability": "Not Ready / Intern-ready / Job-ready"
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
            "score": 0,
            "level": "Unknown",
            "skills": [],
            "strengths": [],
            "weaknesses": [],
            "suggestions": ["Failed to parse AI response. Please try again."],
            "missing_skills": [],
            "activity_insights": [],
            "project_insights": [],
            "hireability": "Unknown"
        }

    return {"feedback": parsed_feedback}
