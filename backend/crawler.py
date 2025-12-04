# crawler.py
import time
import uuid
from collections import deque, defaultdict
from urllib.parse import urlparse, urlunparse
import os
import multiprocessing as mp
import urllib.robotparser
from db import get_db
from scraper import scrape_website

db = get_db()
scraperdb_collection = db["data"]
progress_collection = db["progress"]

# default politeness delay (seconds)
POLITENESS_DELAY = float(os.getenv("POLITENESS_DELAY", "1.0"))

# max links enqueued per domain to avoid explosion
MAX_QUEUE_PER_DOMAIN = int(os.getenv("MAX_QUEUE_PER_DOMAIN", "2000"))


def normalize_url(url: str) -> str:
    """
    Better canonicalization:
    - ensure scheme (default to http if missing)
    - strip trailing slash (but keep "/" for root)
    - remove params, query, fragment
    """
    if not url:
        return url
    parsed = urlparse(url, scheme="http")
    scheme = parsed.scheme or "http"
    netloc = parsed.netloc or parsed.path  # handle 'example.com' passed without scheme
    path = parsed.path.rstrip("/") or "/"
    return urlunparse((scheme, netloc, path, "", "", ""))


def is_binary_url(url: str) -> bool:
    lower = url.lower()
    binary_exts = (".pdf", ".png", ".jpg", ".jpeg", ".gif", ".zip", ".tar", ".gz", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".svg", ".ico", ".mp4", ".mp3")
    return any(lower.endswith(ext) for ext in binary_exts)


class CrawlTask:
    def __init__(self, start_url: str, job_id: str = None, max_pages: int = 1, max_depth: int = 10):
        self.start_url = normalize_url(start_url)
        self.start_domain = urlparse(self.start_url).netloc
        self.job_id = job_id or str(uuid.uuid4())
        self.max_pages = max(1, int(max_pages))
        self.max_depth = int(max_depth)
        self.visited = set()
        self.queue = deque([(self.start_url, 0)])
        self.count = 0
        self.domain_queue_counts = defaultdict(int)
        # Initialize progress in DB
        self._set_progress({
            "job_id": self.job_id,
            "url": self.start_url,
            "total": self.max_pages,
            "done": 0,
            "status": "running",
            "current_url": None,
            "started_at": time.time()
        })

        # robots parser for start domain
        self.rp = urllib.robotparser.RobotFileParser()
        try:
            base = f"{urlparse(self.start_url).scheme}://{self.start_domain}"
            self.rp.set_url(f"{base}/robots.txt")
            self.rp.read()
        except Exception:
            # if robots can't be read, default to allow
            self.rp = None

    def _set_progress(self, data: dict):
        data["updated_at"] = time.time()
        try:
            progress_collection.update_one({"job_id": self.job_id}, {"$set": data}, upsert=True)
        except Exception:
            # avoid crashes on DB error; best-effort
            pass

    def _can_fetch(self, url: str) -> bool:
        if self.rp is None:
            return True
        try:
            return self.rp.can_fetch("*", url)
        except Exception:
            return True

    def run(self):
        try:
            while self.queue and self.count < self.max_pages:
                url, depth = self.queue.popleft()
                normalized_url = normalize_url(url)
                if normalized_url in self.visited:
                    continue
                # robots.txt check
                if not self._can_fetch(normalized_url):
                    self._set_progress({"current_url": normalized_url, "status": "running", "note": "disallowed_by_robots"})
                    continue
                # skip binary files
                if is_binary_url(normalized_url):
                    continue

                # per-domain queue limits
                domain = urlparse(normalized_url).netloc
                if self.domain_queue_counts[domain] >= MAX_QUEUE_PER_DOMAIN:
                    continue

                self.visited.add(normalized_url)
                self.domain_queue_counts[domain] += 1

                # update progress
                self._set_progress({
                    "current_url": normalized_url,
                    "status": "running",
                })

                try:
                    scraped = scrape_website(normalized_url)
                except Exception as e:
                    # record error note
                    self._set_progress({
                        "current_url": normalized_url,
                        "status": "running",
                        "last_error": str(e),
                    })
                    continue

                # Save to DB (upsert to avoid duplicates)
                try:
                    if isinstance(scraped, dict) and scraped.get("url"):
                        scraperdb_collection.update_one(
                            {"url": scraped["url"]},
                            {"$set": scraped},
                            upsert=True
                        )
                    else:
                        # fallback: store minimal doc
                        scraperdb_collection.insert_one({"url": normalized_url, "raw": scraped})
                except Exception as e:
                    # log but don't crash
                    print(f"❌ MongoDB Insert failed for {normalized_url}: {e}")

                self.count += 1
                self._set_progress({"done": self.count})

                print(f"[{self.count}] Scraped: {normalized_url} (depth={depth})")

                # enqueue same-domain links
                if depth < self.max_depth:
                    for link in scraped.get("base_links", []) if isinstance(scraped, dict) else []:
                        norm_link = normalize_url(link)
                        link_domain = urlparse(norm_link).netloc
                        if link_domain == self.start_domain and norm_link not in self.visited:
                            self.queue.append((norm_link, depth + 1))

                time.sleep(POLITENESS_DELAY)

            # finished
            self._set_progress({
                "status": "finished",
                "current_url": None,
                "done": self.count,
                "finished_at": time.time()
            })
            print(f"\n✅ Crawl finished. Total crawled {self.count} pages.\n")
        except Exception as e:
            self._set_progress({"status": "error", "current_url": None, "last_error": str(e)})
            print(f"⚠️ Crawl error: {e}")

    @staticmethod
    def start_async(start_url: str, max_pages: int = 1, max_depth: int = 10, job_id: str = None):
        task = CrawlTask(start_url=start_url, job_id=job_id, max_pages=max_pages, max_depth=max_depth)
        p = mp.Process(target=task.run, daemon=True)
        p.start()
        return task.job_id

# Backwards-friendly helper functions
def crawl_website(start_url: str, max_pages: int = 1, max_depth: int = 10, job_id: str = None):
    """
    Synchronous call (keeps compatibility), runs crawl in current process.
    Prefer start_async_crawl for background runs.
    """
    task = CrawlTask(start_url=start_url, job_id=job_id, max_pages=max_pages, max_depth=max_depth)
    task.run()
    return task.job_id

def start_async_crawl(start_url: str, max_pages: int = 1, max_depth: int = 10):
    """
    Starts a crawl as a separate process and returns job_id immediately.
    Used by main.py to avoid blocking.
    """
    
    return CrawlTask.start_async(start_url=start_url, max_pages=max_pages, max_depth=max_depth)
