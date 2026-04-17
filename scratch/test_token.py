import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("GITHUB_TOKEN")
headers = {"Authorization": f"Bearer {token}"}

query = """
query {
  viewer {
    login
  }
}
"""

url = "https://api.github.com/graphql"
try:
    resp = requests.post(url, json={"query": query}, headers=headers)
    print(f"Status Code: {resp.status_code}")
    print(f"Response: {resp.json()}")
except Exception as e:
    print(f"Exception: {e}")
