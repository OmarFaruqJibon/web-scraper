import time
from collections import deque
from pymongo import MongoClient
from scraper import scrape_website
# from scraper_ai import scrape_website

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
    """
    Normalize a URL to avoid duplicates.
    Keeps scheme, domain, and path only.
    """
    parsed = urlparse(url)
    return urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path.rstrip("/"),
        "", "", ""  # strip params, query, fragment
    ))


def crawl_website(start_url: str, max_pages: int = 10):
    visited = set()
    queue = deque([start_url])
    count = 0

    # Domain restriction
    start_domain = urlparse(start_url).netloc

    # Reset progress
    crawl_progress["total"] = max_pages
    crawl_progress["done"] = 0
    crawl_progress["status"] = "running"
    crawl_progress["current_url"] = start_url

    try:
        while queue and count < max_pages:
            url = queue.popleft()
            normalized_url = normalize_url(url)

            if normalized_url in visited:
                continue
            visited.add(normalized_url)

            crawl_progress["current_url"] = normalized_url

            try:
                scraped = scrape_website(normalized_url)
            except Exception as e:
                print(f"Error scraping {normalized_url}: {e}")
                continue

            scraperdb_collection.insert_one(scraped)
            count += 1
            crawl_progress["done"] = count
            print(f"[{count}] Scraped: {normalized_url}")

            # Expand crawl with same-domain links
            for link in scraped.get("base_links", []):
                norm_link = normalize_url(link)
                link_domain = urlparse(norm_link).netloc

                if link_domain == start_domain and norm_link not in visited:
                    queue.append(norm_link)

            time.sleep(1)  # politeness delay

        crawl_progress["status"] = "finished"
        crawl_progress["current_url"] = None
        print(f"\n✅ Crawl process finished. Total crawled {crawl_progress['done']} pages.\n")

    except Exception as e:
        crawl_progress["status"] = "error"
        print(f"Crawl error: {e}")
