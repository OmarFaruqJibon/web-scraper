# main.py
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


def crawl_website(start_url: str, max_pages: int = 1):
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
# scraper.py

import re
import html
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

from scrapeName import extract_names  


def scrape_website(url: str):
    try:
        # Selenium options
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

        # Remove scripts/styles
        for script in soup(["script", "style"]):
            script.decompose()

        text = soup.get_text(" ", strip=True)

        # --- Emails ---
        emails_text = re.findall(
            r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html.unescape(text)
        )
        emails_mailto = [
            a["href"].split("mailto:")[1].split("?")[0].strip()
            for a in soup.find_all("a", href=True)
            if a["href"].lower().startswith("mailto:")
        ]
        emails = list(set([e.lower() for e in emails_text + emails_mailto]))

        # --- Phones ---
        raw_phones = re.findall(r"(\+?\d[\d\s\-\(\)]{7,}\d)", text)
        normalized_map = {}
        for phone in raw_phones:
            norm = re.sub(r"[()\s\-]", "", phone)
            norm = re.sub(r"^\+{2,}", "+", norm)
            if norm not in normalized_map:
                cleaned_display = re.sub(r"[()\s\-]+", " ", phone).strip()
                normalized_map[norm] = cleaned_display
        phones = list(normalized_map.values())

        # --- Names ---
        names = extract_names(soup, text)

        # --- Links ---
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

        # --- Images ---
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



# scrapeName.py
import re
import spacy
from nltk.corpus import names as nltk_names
from fuzzywuzzy import fuzz
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification

# --- Load spaCy (English NER) ---
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# --- Load Hugging Face Bangla NER model ---
bn_tokenizer = AutoTokenizer.from_pretrained("sagorsarker/mbert-bengali-ner")
bn_model = AutoModelForTokenClassification.from_pretrained("sagorsarker/mbert-bengali-ner")
bn_ner = pipeline(
    "ner",
    model=bn_model,
    tokenizer=bn_tokenizer,
    aggregation_strategy="simple"
)

# --- Load English name dictionary ---
try:
    first_names = set(nltk_names.words("male.txt") + nltk_names.words("female.txt"))
except:
    import nltk
    nltk.download("names")
    first_names = set(nltk_names.words("male.txt") + nltk_names.words("female.txt"))

# --------------------------
# Stop-word cleaner
# --------------------------
STOP_PATTERNS = [
    r"\bProfessor\b.*", r"\bAssociate\b.*", r"\bAssistant\b.*",
    r"\bLecturer\b.*", r"\bResearch(er| Fellow)\b.*", r"\bConsultant\b.*",
    r"\bSpecialist\b.*", r"\bDepartment\b.*", r"\bFaculty\b.*", r"\bUniversity\b.*",
    r"\bHead\b.*", r"\bChair(man|person)?\b.*", r"\bCoordinator\b.*",
    r"\bDean\b.*", r"\bDirector\b.*", r"\bProfile\b.*", r"\bDept\b.*",
    r"\bPh\.?D\b.*", r"\bM\.?Sc\b.*", r"\bB\.?Sc\b.*", r"\bMBBS\b.*",
    r"\bMS\b.*", r"\bMD\b.*", r"\bFCPS\b.*", r"\bFRCS\b.*", r"\bFACS\b.*",
    r"\bEngg\b.*", r"\bEngineering\b.*"
]

def strip_titles_and_degrees(name: str) -> str:
    """
    Remove academic/job titles or trailing degree info from names.
    Works for both English and Bangla.
    """
    # Remove commas and extra text after them
    name = re.split(r"[,-]", name)[0].strip()

    # Remove stopword patterns
    for pat in STOP_PATTERNS:
        name = re.sub(pat, "", name, flags=re.IGNORECASE).strip()

    # Remove multiple spaces
    name = re.sub(r"\s+", " ", name).strip()

    return name


# --------------------------
# Helpers
# --------------------------
def clean_and_validate_names(all_names, lang="en"):
    """
    Filter out false positives and non-person-like names.
    """
    false_positives = {
        "Privacy Policy", "Terms of Service", "Contact Us", "About Us",
        "Sign In", "Log In", "Sign Up", "Home", "Products", "Services",
        "Blog", "News", "Careers", "Support", "Help", "FAQ", "Professor",
        "Employee", "Lecturer", "University", "Department", "Dept", "Profile", "Home", "All", "Employee", "Others", "Notices", "Member", "Information", "Charter", "People", "Study Leave", "Study", "Home Pages All", "Home Page", "dept", "Home About", "People Ex", "Advisory Committee", "Staff List Events", "Services Important Links", "Publications Online Services", "Google Classroom", "Google", "Library"
    }

    cleaned = set()
    for name in all_names:
        name = strip_titles_and_degrees(name)

        if not name or name in false_positives:
            continue
        if len(name) < 2 or len(name) > 80:
            continue

        tokens = name.split()
        valid = False

        if lang == "en":
            if tokens[0].lower().rstrip(".") in ["dr", "md", "mr", "prof", "engr"]:
                valid = True

            if not valid:
                for token in tokens:
                    for fname in first_names:
                        if fuzz.ratio(token.lower(), fname.lower()) >= 90:
                            valid = True
                            break
                    if valid:
                        break

            if not valid and len(tokens) >= 2 and all(t[0].isupper() for t in tokens if t.isalpha()):
                valid = True

            if not valid:
                continue

        elif lang == "bn":
            # Must be at least two Bangla words
            if len(tokens) >= 2 and all(re.match(r"^[\u0980-\u09FF]+$", t) for t in tokens):
                valid = True
            else:
                continue

        cleaned.add(name)

    return sorted(cleaned)


# --------------------------
# English name extractor
# --------------------------
def extract_english_names(soup, text: str):
    all_names = set()

    # spaCy NER
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate = ent.text.strip()
            if 2 <= len(candidate.split()) <= 6:
                all_names.add(candidate)

    # Regex for prefixed names
    prefixed_patterns = [
        r"\b(?:Dr|Prof|Mr|Engr)\.?\s+[A-Z][a-zA-Z\.]+(?:\s+[A-Z][a-zA-Z\.]+){0,5}(?:\s*\([A-Za-z]+\))?"
    ]
    for pat in prefixed_patterns:
        matches = re.findall(pat, text, re.IGNORECASE)
        all_names.update([m.strip() for m in matches])

    # Fallback: stricter capitalized names (avoid academic terms)
    fallback = re.findall(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b", text)
    for f in fallback:
        if not re.search(r"(University|Department|Computer|System|Engineering|Science)", f, re.IGNORECASE):
            all_names.add(f.strip())
    

    return clean_and_validate_names(all_names, lang="en")


# --------------------------
# Bangla name extractor
# --------------------------
def extract_bangla_names(text: str):
    try:
        results = bn_ner(text)
        all_names = set()
        for r in results:
            if r["entity_group"] == "PER":
                all_names.add(r["word"].strip())
        return clean_and_validate_names(all_names, lang="bn")
    except Exception as e:
        print(f"BanglaBERT NER error: {e}")
        return []


# --------------------------
# Combined Extractor
# --------------------------
def extract_names(soup, text: str):
    english_names = extract_english_names(soup, text)
    bangla_names = extract_bangla_names(text)
    return sorted(set(english_names + bangla_names))
