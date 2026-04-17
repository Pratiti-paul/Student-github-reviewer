import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("GITHUB_TOKEN")
headers = {"Authorization": f"Bearer {token}"}

# This is the exact query from agent/nodes.py
query = """
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            color
          }
        }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      nodes {
        languages(first: 10) {
          edges {
            size
            node {
              name
            }
          }
        }
      }
    }
  }
}
"""

url = "https://api.github.com/graphql"
# Testing with the token's owner
username = "Pratiti-paul"

try:
    resp = requests.post(url, json={"query": query, "variables": {"username": username}}, headers=headers)
    print(f"Status Code: {resp.status_code}")
    data = resp.json()
    print(f"Full Response: {data}")
except Exception as e:
    print(f"Exception: {e}")
