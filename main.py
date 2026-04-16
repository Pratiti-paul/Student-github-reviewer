from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from agent.graph import github_reviewer_app 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReviewRequest(BaseModel):
    username: str

# Simple in-memory cache
REVIEW_CACHE = {}

@app.get("/")
def home():
    return {"message": "GitHub Reviewer backend is running perfectly!"}

@app.post("/review")
def review_portfolio(request: ReviewRequest):
    # Check cache first
    username_lower = request.username.lower().strip()
    if username_lower in REVIEW_CACHE:
        return REVIEW_CACHE[username_lower]

    # 1. Create the starting point for our agents
    initial_state = {"username": request.username}
    
    # 2. Tell the LangGraph brain to start thinking!
    result = github_reviewer_app.invoke(initial_state)
    
    # 3. Return the AI's final answer flattenly
    feedback_data = result.get("feedback", {})
    
    # Save to cache
    REVIEW_CACHE[username_lower] = feedback_data
    
    return feedback_data
