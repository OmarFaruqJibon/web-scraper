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

def crawl_website(start_url: str, max_pages: int = 10):
    visited = set()
    queue = deque([start_url])
    count = 0

    while queue and count < max_pages:
        url = queue.popleft()
        if url in visited:
            continue
        visited.add(url)

        try:
            scraped = scrape_website(url)
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            continue

        scraperdb_collection.insert_one(scraped)
        count += 1
        print(f"[{count}] Scraped: {url}")

        for link in scraped.get("base_links", []):
            if link not in visited:
                queue.append(link)

        time.sleep(1)  # politeness delay
