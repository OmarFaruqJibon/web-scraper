# main.py:
import uvicorn
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Import crawler
from crawler import crawl_website , crawl_progress

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["scraperdb"]       
scraperdb_collection = db["data"]  

class Data(BaseModel):
    url: str

app = FastAPI()

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def get_root():
    return {"Message": "Backend Server is running"}


@app.get("/data")
def get_data():
    datas = list(scraperdb_collection.find({}, {"_id": 0})) 
    return {"dataCollections": datas}

@app.get("/progress")
def get_progress():
    return crawl_progress


@app.post("/crawl")
def start_crawl(data: Data, background_tasks: BackgroundTasks):
    background_tasks.add_task(crawl_website, data.url)
    return {"message": f"Crawling started for {data.url}"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)






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



# scraper.py
import re
import html
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import spacy

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
    print("✅ spaCy model loaded successfully")
except OSError:
    print("Downloading spaCy model...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")
    print("✅ spaCy model downloaded and loaded")

def extract_names_combined(soup, text: str) -> list:
    """
    Extract person names using multiple methods for better coverage.
    """
    all_names = set()
    
    # Method 1: spaCy NER
    try:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ == "PERSON" and len(ent.text.strip()) >= 3:
                name = ent.text.strip()
                # Basic filtering
                if (not any(char.isdigit() for char in name) and
                    not any(word in name.lower() for word in 
                           ['javascript', 'cookie', 'policy', 'terms', 'privacy'])):
                    all_names.add(name)
    except Exception as e:
        print(f"spaCy error: {e}")
    
    # Method 2: Look for common name patterns in text
    name_patterns = [
        r"(?:Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+\s+[A-Z][a-z]+",
        r"[A-Z][a-z]+\s+[A-Z][a-z]+",
        r"[A-Z][a-z]+,?\s+[A-Z]\.\s+[A-Z][a-z]+",
    ]
    
    for pattern in name_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            if len(match.split()) <= 4:  # Reasonable name length
                all_names.add(match)
    
    # Method 3: Look for names in specific HTML elements
    name_selectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        '[class*="name"]', '[class*="author"]', '[class*="team"]',
        '[class*="staff"]', '[class*="profile"]', '[class*="bio"]',
        '[id*="name"]', '[id*="author"]', '[id*="team"]',
        '[id*="staff"]', '[id*="profile"]', '[id*="bio"]'
    ]
    
    for selector in name_selectors:
        try:
            elements = soup.select(selector)
            for elem in elements:
                elem_text = elem.get_text(strip=True)
                if 2 <= len(elem_text.split()) <= 4 and elem_text[0].isupper():
                    all_names.add(elem_text)
        except:
            continue
    
    # Method 4: Look for linked names (often in team pages)
    for a in soup.find_all('a', href=True):
        link_text = a.get_text(strip=True)
        href = a['href'].lower()
        
        # Check if link text looks like a name
        if (2 <= len(link_text.split()) <= 4 and 
            link_text[0].isupper() and
            not any(char.isdigit() for char in link_text)):
            
            # Check if URL suggests this is a person
            if any(keyword in href for keyword in 
                  ['about', 'team', 'staff', 'profile', 'author', 'bio']):
                all_names.add(link_text)
    
    # Method 5: Look for email usernames that might be names
    emails = re.findall(r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b", text)
    for email in emails:
        username = email.split('@')[0]
        # If username looks like a name (contains dots or capitalization patterns)
        if '.' in username or (username[0].isupper() and any(c.isupper() for c in username[1:])):
            # Replace dots and underscores with spaces
            potential_name = re.sub(r'[._]', ' ', username)
            if 1 <= len(potential_name.split()) <= 3:
                all_names.add(potential_name)
    
    # Filter out common false positives
    false_positives = {
        'Privacy Policy', 'Terms of Service', 'Contact Us', 'About Us', 
        'Sign In', 'Log In', 'Sign Up', 'Home', 'Products', 'Services',
        'Blog', 'News', 'Careers', 'Support', 'Help', 'FAQ', 'Cookie Policy'
    }
    
    # Additional filtering
    filtered_names = set()
    for name in all_names:
        # Skip if it's a false positive
        if name in false_positives:
            continue
            
        # Skip if it's too short or too long
        if len(name) < 4 or len(name) > 50:
            continue
            
        # Skip if it contains obviously non-name words
        if any(word in name.lower() for word in 
              ['login', 'signup', 'menu', 'search', 'download', 'subscribe']):
            continue
            
        filtered_names.add(name)
    
    return list(filtered_names)

def scrape_website(url: str):
    try:
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--remote-debugging-port=9222")

        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()), options=options
        )

        driver.get(url)
        page_source = driver.page_source
        driver.quit()

        soup = BeautifulSoup(page_source, "html.parser")
        
        # Get cleaner text by removing script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        text = soup.get_text(" ", strip=True)

        # Extract emails
        emails_text = re.findall(
            r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html.unescape(text)
        )
        emails_mailto = [
            a["href"].split("mailto:")[1].split("?")[0].strip()
            for a in soup.find_all("a", href=True)
            if a["href"].lower().startswith("mailto:")
        ]
        emails = list(set([e.lower() for e in emails_text + emails_mailto]))

        # Extract phones
        raw_phones = re.findall(r"(\+?\d[\d\s\-\(\)]{7,}\d)", text)
        normalized_map = {}
        for phone in raw_phones:
            norm = re.sub(r"[()\s\-]", "", phone)
            norm = re.sub(r"^\+{2,}", "+", norm)
            if norm not in normalized_map:
                cleaned_display = re.sub(r"[()\s\-]+", " ", phone).strip()
                normalized_map[norm] = cleaned_display
        phones = list(normalized_map.values())

        # Extract person names using combined approach
        names = extract_names_combined(soup, text)

        # Extract links
        base_domain = urlparse(url).netloc
        base_links, external_links = [], []
        for a in soup.find_all("a", href=True):
            abs_link = urljoin(url, a["href"])
            link_domain = urlparse(abs_link).netloc
            if (
                link_domain
                and link_domain != base_domain
                and not abs_link.startswith("mailto:")
                and not abs_link.startswith("tel:")
            ):
                external_links.append(abs_link)
            if link_domain == base_domain:
                base_links.append(abs_link)

        # Extract images
        images = [urljoin(url, img["src"]) for img in soup.find_all("img", src=True)]

        title = soup.title.string if soup.title else None

        return {
            "url": url,
            "title": title,
            "emails": emails,
            "phones": phones,
            "names": names,
            "external_links": list(set(external_links)),
            "base_links": list(set(base_links)),
            "images": list(set(images)),
        }

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {"error": str(e), "url": url}