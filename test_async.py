import asyncio
from main import review_portfolio, ReviewRequest

async def main():
    print("Testing review_portfolio...")
    req = ReviewRequest(username="torvalds")
    try:
        res = await review_portfolio(req)
        print("Result:", res)
    except Exception as e:
        print("Error:", e)

asyncio.run(main())
