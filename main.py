import os
import json
import logging
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import redis
from agent.graph import github_reviewer_app 

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

@app.get("/")
def home():
    return {"message": "GitHub Reviewer backend is running perfectly!"}

@app.post("/review")
def review_portfolio(request: ReviewRequest):
    username_lower = request.username.lower().strip()
    cache_key = f"review:{username_lower}"
    
    # 1. Check Redis Cache First
    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                logger.info(f"CACHE HIT for {username_lower}")
                return json.loads(cached_data)
        except Exception as e:
            logger.warning(f"Redis GET failed: {e}")

    logger.info(f"CACHE MISS for {username_lower}. Computing insights...")

    # 2. Tell the LangGraph brain to start thinking
    initial_state = {"username": request.username}
    result = github_reviewer_app.invoke(initial_state)
    feedback_data = result.get("feedback", {})
    
    # 3. Store result in Redis for 24 hours
    if redis_client:
        try:
            # TTl is 86400 seconds (24 hours)
            redis_client.setex(cache_key, 86400, json.dumps(feedback_data))
            logger.info(f"Successfully cached insights for {username_lower}")
        except Exception as e:
            logger.warning(f"Redis SET failed: {e}")
            
    return feedback_data

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
