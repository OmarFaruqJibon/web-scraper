# scraper.py
import time
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from llm_extractor import process_with_ollama, merge_results


# -------- Helper: DOM stabilization --------
def wait_for_stable_dom(page, timeout=30, stable_time=2):
    """Wait until DOM stops changing for a given stable_time (seconds)."""
    end_time = time.time() + timeout
    last_html = ""
    stable_start = None

    while time.time() < end_time:
        html = page.content()
        if html == last_html:
            if stable_start is None:
                stable_start = time.time()
            elif time.time() - stable_start >= stable_time:
                return True
        else:
            stable_start = None
        last_html = html
        time.sleep(0.5)
    return False


# -------- Helper: Auto-scroll for lazy-loading --------
def auto_scroll(page, pause=1.0, max_attempts=20):
    """Scroll to bottom to trigger lazy loading/infinite scroll."""
    last_height = page.evaluate("() => document.body.scrollHeight")
    for _ in range(max_attempts):
        page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(pause)
        new_height = page.evaluate("() => document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height
    print("✅ Finished auto-scrolling\n")


# --- Extract body text and keep <img> inline ---
def extract_text_with_images(soup):
    """Convert <body> into text, keeping <img src alt> inline."""
    parts = []
    if not soup.body:
        return str(soup)  # fallback

    for elem in soup.body.descendants:
        if elem.name == "img":
            parts.append(f"<img src='{elem.get('src', '')}' alt='{elem.get('alt', '')}'>")
        elif elem.string and elem.string.strip():
            parts.append(elem.string.strip())

    return " ".join(parts)

# -------- Helper: Chunking --------
def chunk_text(text: str, chunk_size=3000, overlap=200):
    """Split text into overlapping chunks with <block> wrappers"""
    chunks, start = [], 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(f"<block>\n{chunk}\n</block>")
        start += chunk_size - overlap
    return chunks

# -------- Scraper Function --------
def scrape_website(url: str):
    """Scrape website, extract information using Playwright and LLM."""

    print(f"\n\n🔎 Scraping: {url} ...\n\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-web-security"
            ]
        )
        page = browser.new_page(user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/117.0.0.0 Safari/537.36"
        ))

        try:
            page.goto(url, timeout=120000)
            print("✅ Browser launched\n")
            page.wait_for_load_state("networkidle", timeout=30000)
            print("✅ Document ready\n")
            auto_scroll(page, pause=1.0, max_attempts=30)
            if wait_for_stable_dom(page, timeout=30, stable_time=2):
                print("✅ DOM stabilized (data loaded)\n")
            else:
                print("⚠️ DOM may still be loading, continuing anyway\n")
            page_source = page.content()

        except Exception as e:
            print(f"⚠️ Playwright error on {url}: {e}")
            return {"error": f"Playwright error: {e}", "url": url}
        finally:
            browser.close()

    # --- Parse with BeautifulSoup ---
    soup = BeautifulSoup(page_source, "html.parser")
    soup_for_links = BeautifulSoup(page_source, "html.parser")
    print("\n✅ Page parsed\n")

    # Remove noise
    for tag in soup(["script", "style", "header", "footer", "nav"]):
        tag.decompose()

    # Inline text + images
    body_text = extract_text_with_images(soup)
    print(f"Body length: {len(body_text)} chars\n")

    # DOM-based chunking
    blocks = chunk_text(body_text, chunk_size=3000, overlap=200)
    print(f"\n✅ Body split into {len(blocks)} blocks\n")

    # --- Send to Ollama in batches ---
    all_results = []
    for i, block in enumerate(blocks, 1):
        print(f"🔹 Processing block {i}/{len(blocks)}")
        print(f"\n\nBlock : {block}\n\n")
        
        res = process_with_ollama(block)
        
        if res and res.get("data"):
            all_results.append(res)
    
    
    print(f"\n\n-------- 🧧 All Result : \n\n {all_results}")

    # Merge results from all blocks
    information = merge_results(all_results)
    print(f"\n✅ Information received from LLM\n")

    # --- Links Extraction ---
    base_domain = urlparse(url).netloc
    base_links, external_links = [], []

    for a in soup_for_links.find_all("a", href=True):
        abs_link = urljoin(url, a["href"])
        link_domain = urlparse(abs_link).netloc

        if link_domain == base_domain and abs_link not in base_links:
            base_links.append(abs_link)
        elif (
            link_domain != base_domain
            and not abs_link.startswith("mailto:")
            and not abs_link.startswith("tel:")
        ):
            external_links.append(abs_link)

    return {
        "url": url,
        "title": soup.title.string.strip() if soup.title else None,
        "information": information,
        "base_links": list(set(base_links)),
        "external_links": list(set(external_links)),
    }




# llm_extractor.py
import requests
import re
import json
import time


def send_to_ollama_chunk(text: str, retries: int = 1):
    """
    Send a chunk of HTML/text to Ollama LLM for structured information extraction.
    Returns parsed JSON data and raw text.
    """
    ollama_url = "http://localhost:11434/api/generate"

    prompt = f"""
        You are a highly accurate web information extraction AI.

        Input:
        - HTML content grouped into <block>...</block>.
        - Each block may describe people, organizations, products, events, services, courses, or general information.
        - Images may appear as <img src='...' alt='...'> → map these to "image" field.

        Task:
        - Extract all factual data into the schema below.
        - Output must be valid JSON **only**. No explanations, no markdown fences.
        - Preserve numbers, currencies, emails, phones, and proper names exactly.
        - If a field is missing, use empty string, empty list, or empty object.

        Schema:
        {{
            "people": [
                {{"name":"","role":"","title":"","email":[],"phone":[],"location":"","image":"","description":""}}
            ],
            "organization": [
                {{"name":"","description":"","type":"","address":"","contact":{{"email":[],"phone":[],"social":[]}},"hours":""}}
            ],
            "products": [
                {{"name":"","category":"","price":"","currency":"","description":"","image":"","reviews":[]}}
            ],
            "events": [
                {{"name":"","date":"","time":"","location":"","description":"","organizer":"","speakers":[]}}
            ],
            "services": [
                {{"name":"","description":"","department":"","contact":{{"email":[],"phone":[]}}}}
            ],
            "courses": [
                {{"name":"","code":"","department":"","duration":"","description":""}}
            ],
            "content": {{"articles":[],"news":[],"blogs":[],"faqs":[],"policies":[],"announcements":[]}},
            "other_info":[]
        }}
        """

    payload = {
        "model": "llama3:8b",
        "prompt": prompt + "\nHTML Block:\n" + text,
        "stream": False
    }

    required_keys = [
        "people", "organization", "products", "events",
        "services", "courses", "content", "other_info"
    ]

    for attempt in range(retries):
        try:
            print("\n🔃 Sending chunk to Ollama\n")
            start_time = time.time()
            
            response = requests.post(ollama_url, json=payload, timeout=1800)
            response.raise_for_status()
            elapsed = time.time() - start_time
            print(f"⚡ Extraction took {elapsed:.2f} sec\n")

            data = response.json()
            raw_text = data.get("response", "").strip()

            # Try parsing JSON
            try:
                parsed = json.loads(raw_text)
                for k in required_keys:
                    if k not in parsed:
                        parsed[k] = [] if k != "content" else {}
                return {"data": parsed, "raw": raw_text}
            except json.JSONDecodeError:
                # Fallback regex
                matches = re.findall(r"\{.*\}", raw_text, re.DOTALL)
                if matches:
                    try:
                        parsed = json.loads(matches[0])
                        for k in required_keys:
                            if k not in parsed:
                                parsed[k] = [] if k != "content" else {}
                        return {"data": parsed, "raw": raw_text}
                    except json.JSONDecodeError:
                        return {"data": {k: [] if k != "content" else {} for k in required_keys}, "raw": raw_text}

            return {"data": {k: [] if k != "content" else {} for k in required_keys}, "raw": raw_text}

        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            print(f"Ollama error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return {"data": {k: [] if k != "content" else {} for k in required_keys}, "raw": ""}


# -------- Deduplication Helpers --------
def deduplicate_items(items, keys=("name", "title", "category", "price")):
    """Generic deduplication based on a set of keys."""
    seen, unique = set(), []
    for item in items:
        key = tuple((item.get(k) or "").strip().lower() for k in keys)
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique


def deduplicate_people(people):
    """Deduplicate people based on name + email + phone."""
    seen, unique = set(), []
    for person in people:
        key = (
            (person.get("name") or "").strip().lower(),
            tuple(sorted([e.lower() for e in person.get("email", [])])),
            tuple(sorted([p for p in person.get("phone", [])]))
        )
        if key not in seen:
            seen.add(key)
            unique.append(person)
    return unique


# -------- Merge Results from Multiple Blocks --------
def merge_results(results):
    """Merge multiple chunk results into one consistent structure."""
    merged = {
        "people": [],
        "organization": [],
        "products": [],
        "events": [],
        "services": [],
        "courses": [],
        "content": {
            "articles": [],
            "news": [],
            "blogs": [],
            "faqs": [],
            "policies": [],
            "announcements": []
        },
        "other_info": []
    }

    for r in results:
        data = r.get("data", {})

        merged["people"].extend(data.get("people", []))
        merged["organization"].extend(data.get("organization", []))
        merged["products"].extend(data.get("products", []))
        merged["events"].extend(data.get("events", []))
        merged["services"].extend(data.get("services", []))
        merged["courses"].extend(data.get("courses", []))

        # Merge content
        for section in ["articles", "news", "blogs", "faqs", "policies", "announcements"]:
            merged["content"][section].extend(data.get("content", {}).get(section, []))

        # Merge other_info
        if isinstance(data.get("other_info"), list):
            merged["other_info"].extend(data.get("other_info"))
        elif isinstance(data.get("other_info"), dict):
            merged["other_info"].append(data.get("other_info"))

    # Deduplicate categories
    merged["people"] = deduplicate_people(merged["people"])
    merged["products"] = deduplicate_items(merged["products"], keys=("name", "category", "price"))
    merged["organization"] = deduplicate_items(merged["organization"], keys=("name",))
    merged["events"] = deduplicate_items(merged["events"], keys=("name", "date"))

    return merged


# -------- Process a Single Block --------
def process_with_ollama(block: str):
    res = send_to_ollama_chunk(block)
    all_data, all_raw = None, []

    if isinstance(res, dict):
        if res.get("data"):
            all_data = res["data"]
        if res.get("raw"):
            all_raw.append(res["raw"])

    return {"data": all_data, "raw": all_raw}
