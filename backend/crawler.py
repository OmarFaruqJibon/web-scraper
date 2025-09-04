# crawler.py
import time
from collections import deque
from pymongo import MongoClient
from scraper import scrape_website
from urllib.parse import urlparse, urlunparse
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["scraperdb"]
scraperdb_collection = db["data"]

# Global progress tracker
crawl_progress = {
    "total": 0,
    "done": 0,
    "status": "idle",   # idle, running, finished, error
    "current_url": None
}


def normalize_url(url: str) -> str:
    """Strip query/hash and normalize URL."""
    parsed = urlparse(url)
    return urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path.rstrip("/"),
        "", "", ""   # remove params, query, fragment
    ))


def crawl_website(start_url: str, max_pages: int = 1, max_depth: int = 10):
    """
    Crawl a website recursively up to max_pages and max_depth.
    """
    visited = set()
    queue = deque([(start_url, 0)])  # store (url, depth)
    count = 0

    start_domain = urlparse(start_url).netloc

    crawl_progress["total"] = max_pages
    crawl_progress["done"] = 0
    crawl_progress["status"] = "running"
    crawl_progress["current_url"] = start_url

    try:
        while queue and count < max_pages:
            url, depth = queue.popleft()
            normalized_url = normalize_url(url)

            if normalized_url in visited:
                continue
            visited.add(normalized_url)

            crawl_progress["current_url"] = normalized_url

            try:
                scraped = scrape_website(normalized_url)
            except Exception as e:
                print(f"❌ Error scraping {normalized_url}: {e}")
                continue
            
            try:
                scraperdb_collection.insert_one(scraped)
                print("Data inserted to DB.")
            except Exception as e:
                print(f"❌ MongoDB Insert failed: {e}")

            # scraperdb_collection.insert_one(scraped)
            count += 1
            crawl_progress["done"] = count
            print(f"[{count}] Scraped: {normalized_url} (depth={depth})")

            # Only go deeper if depth limit not exceeded
            if depth < max_depth:
                for link in scraped.get("base_links", []):
                    norm_link = normalize_url(link)
                    link_domain = urlparse(norm_link).netloc
                    if link_domain == start_domain and norm_link not in visited:
                        queue.append((norm_link, depth + 1))

            time.sleep(1)  # politeness delay

        crawl_progress["status"] = "finished"
        crawl_progress["current_url"] = None
        print(f"\n✅ Crawl finished. Total crawled {crawl_progress['done']} pages.\n")

    except Exception as e:
        crawl_progress["status"] = "error"
        crawl_progress["current_url"] = None
        print(f"⚠️ Crawl error: {e}")
