import os
import redis
from dotenv import load_dotenv

load_dotenv()

redis_url = os.getenv("REDIS_URL")
if not redis_url:
    print("REDIS_URL not found in .env")
    exit(1)

try:
    client = redis.from_url(redis_url, decode_responses=True)
    keys = client.keys("review:*")
    if keys:
        client.delete(*keys)
        print(f"Successfully cleared {len(keys)} stale cache entries: {keys}")
    else:
        print("No stale cache entries found.")
except Exception as e:
    print(f"Error clearing cache: {e}")
