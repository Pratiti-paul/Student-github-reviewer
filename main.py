import os
import json
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import redis
from agent.graph import github_reviewer_app 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Refined CORS to include production URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://repo-insight-7hv9yx07k-pratitis-projects.vercel.app",
        "https://repoinsight-sjb.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Print all registered routes on startup for debugging."""
    logger.info("=== REGISTERED ROUTES ===")
    for route in app.routes:
        methods = ", ".join(route.methods) if hasattr(route, "methods") else "GET"
        logger.info(f"Route: {route.path} | Methods: [{methods}]")
    logger.info("=========================")

class ReviewRequest(BaseModel):
    username: str

# ... (Previous Redis and get_or_compute_review code remains same) ...
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL:
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        logger.info("Redis persistent caching configured.")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}. Falling back to no caching.")
        redis_client = None
else:
    logger.info("REDIS_URL not found. Persistent caching disabled.")
    redis_client = None

def get_or_compute_review(username: str):
    username_lower = username.lower().strip()
    cache_key = f"review:{username_lower}"
    
    # 1. Check Redis Cache First
    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                parsed = json.loads(cached_data)
                # IMPORTANT: If cached data is "Partial" (missing metrics), force a re-compute
                if "metrics" in parsed:
                    logger.info(f"CACHE HIT for {username_lower}")
                    return parsed
                else:
                    logger.info(f"STALE CACHE found for {username_lower}. Re-computing...")
        except Exception as e:
            logger.warning(f"Redis GET failed: {e}")

    logger.info(f"CACHE MISS for {username_lower}. Computing insights...")

    # 2. Tell the LangGraph brain to start thinking
    initial_state = {"username": username}
    result = github_reviewer_app.invoke(initial_state)
    
    # 3. Handle Errors coming from the graph
    github_data_raw = result.get("github_data", {})
    if isinstance(github_data_raw, dict) and "error" in github_data_raw:
        raise HTTPException(
            status_code=github_data_raw.get("status", 500),
            detail=github_data_raw.get("error")
        )

    # 4. Prepare Unified Response
    feedback = result.get("feedback", {})
    full_response = {
        **feedback,
        "raw_repos": result.get("github_data", []),
        "user_profile": result.get("user_profile", {}),
        "metrics": result.get("metrics", {})
    }
    
    # 5. Store result in Redis for 24 hours
    if redis_client:
        try:
            redis_client.setex(cache_key, 86400, json.dumps(full_response))
            logger.info(f"Successfully cached FULL insights for {username_lower}")
        except Exception as e:
            logger.warning(f"Redis SET failed: {e}")
            
    return full_response

@app.get("/")
def home():
    return {"message": "GitHub Reviewer backend is running perfectly!"}

@app.get("/test")
@app.post("/test")
def test_route():
    """Temporary debug route to verify connectivity."""
    return {"status": "ok", "message": "Backend connectivity verified!"}

@app.get("/review/{username}")
def get_review(username: str):
    return get_or_compute_review(username)

@app.post("/review")
def post_review(request: ReviewRequest):
    return get_or_compute_review(request.username)

@app.delete("/clear-cache/{username}")
def clear_cache(username: str):
    if not redis_client:
        return {"message": "Caching is not enabled."}
        
    username_lower = username.lower().strip()
    cache_key = f"review:{username_lower}"
    try:
        deleted = redis_client.delete(cache_key)
        if deleted:
            logger.info(f"Cache explicitly cleared for {username_lower}")
            return {"message": f"Cache cleared for {username}."}
        return {"message": "User not found in cache."}
    except Exception as e:
        logger.error(f"Redis DELETE failed: {e}")
        return {"error": "Failed to clear cache"}

