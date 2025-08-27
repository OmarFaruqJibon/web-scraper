import time
from collections import deque
from pymongo import MongoClient
from scraper import scrape_website
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["scraperdb"]
scraperdb_collection = db["data"]

# Global progress tracker (mutable dict, no reassignment)
crawl_progress = {
    "total": 0,
    "done": 0,
    "status": "idle",   # idle, running, finished, error
    "current_url": None
}

def crawl_website(start_url: str, max_pages: int = 5):
    visited = set()
    queue = deque([start_url])
    count = 0

    # Reset progress (mutate dict instead of reassigning)
    crawl_progress["total"] = max_pages
    crawl_progress["done"] = 0
    crawl_progress["status"] = "running"
    crawl_progress["current_url"] = start_url

    try:
        while queue and count < max_pages:
            url = queue.popleft()
            if url in visited:
                continue
            visited.add(url)

            crawl_progress["current_url"] = url
 
            try:
                scraped = scrape_website(url)
            except Exception as e:
                print(f"Error scraping {url}: {e}")
                continue

            scraperdb_collection.insert_one(scraped)
            count += 1
            crawl_progress["done"] = count
            print(f"[{count}] Scraped: {url}")

            for link in scraped.get("base_links", []):
                if link not in visited:
                    queue.append(link)

            time.sleep(1)  # politeness delay

        crawl_progress["status"] = "finished"
        crawl_progress["current_url"] = None

        print(f"\n✅ Crawl process finished. Total crawled {crawl_progress['done']} pages.\n")

    except Exception as e:
        crawl_progress["status"] = "error"
        print(f"Crawl error: {e}")
