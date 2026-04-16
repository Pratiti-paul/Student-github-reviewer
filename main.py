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

@app.get("/")
def home():
    return {"message": "GitHub Reviewer backend is running perfectly!"}

@app.post("/review")
def review_portfolio(request: ReviewRequest):
    # 1. Create the starting point for our agents
    initial_state = {"username": request.username}
    
    # 2. Tell the LangGraph brain to start thinking!
    result = github_reviewer_app.invoke(initial_state)
    
    # 3. Return the AI's final answer
    return {
        "username": result["username"], 
        "extracted_data": result.get("github_data"),
        "mentor_feedback": result.get("feedback")
    }
