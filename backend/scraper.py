# scraper.py
import time
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from llm_extractor import process_with_ollama, merge_results
from gemini_ai import send_to_gemini


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
# def extract_text_with_images(soup):
#     parts = []
#     if not soup.body:
#         return str(soup)  

#     for elem in soup.body.descendants:
#         if elem.name == "img":
#             parts.append(f"<img src='{elem.get('src', '')}' alt='{elem.get('alt', '')}'>")
#         elif elem.string and elem.string.strip():
#             parts.append(elem.string.strip())

#     return " ".join(parts)


# def extract_text_with_images(soup, base_url: str):
#     parts = []
#     if not soup.body:
#         return str(soup)

#     for elem in soup.body.descendants:
#         if elem.name == "img":
#             raw_src = elem.get("src", "")
#             abs_src = urljoin(base_url, raw_src) if raw_src else ""
#             parts.append(f"<img src='{abs_src}' alt='{elem.get('alt', '')}'>")
#         elif elem.string and elem.string.strip():
#             parts.append(elem.string.strip())

#     return " ".join(parts)

def extract_text_with_media(soup):
    """
    Extracts text but keeps <img> and <a> (for social/profile links).
    Returns a simplified HTML-like string.
    """
    parts = []
    if not soup.body:
        return str(soup)

    for elem in soup.body.descendants:
        if elem.name == "img":
            parts.append(
                f"<img src='{elem.get('src', '')}' alt='{elem.get('alt', '')}'>"
            )
        elif elem.name == "a" and elem.get("href"):
            text = elem.get_text(strip=True) or ""
            href = elem["href"]
            parts.append(f"<a href='{href}'>{text}</a>")
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
            
            try:
                page.wait_for_load_state("domcontentloaded", timeout=20000)
                
                try:
                    page.wait_for_load_state("networkidle", timeout=20000)
                except:
                    print("⚠️ networkidle not reached, relying on stable DOM instead")
                if wait_for_stable_dom(page, timeout=30, stable_time=2):
                    print("✅ DOM stabilized")
                    
            except Exception as e:
                print(f"⚠️ Playwright load issue: {e}")
            
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
    soup_for_base_url = BeautifulSoup(page_source, "html.parser")
    print("\n✅ Page parsed\n")
        
    # --- Links Extraction ---
    base_domain = urlparse(url).netloc
    base_links, external_links = [], []

    for a in soup_for_base_url.find_all("a", href=True):
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

    # Remove noise
    for tag in soup(["script", "style", "header", "footer", "nav"]):
        tag.decompose()

    # body_text = extract_text_with_images(soup, base_domain)
    
    body_text = extract_text_with_media(soup)

    
    
    # print(f"Body text: {body_text}\n")

    blocks = chunk_text(body_text, chunk_size=3000, overlap=200)
    print(f"\n✅ Body split into {len(blocks)} blocks\n")

    # --- Send to Ollama in batches ---
    all_results = []
    for i, block in enumerate(blocks, 1):
        print(f"🔹 Processing block {i}/{len(blocks)}")
        print(f"\n Block: {block}\n")
        res = process_with_ollama(block)
        if res and res.get("data"):
            all_results.append(res["data"])

    print(f"\n\n-----------🧧 ALL RESULTS--------- \n\n {all_results}")
    
    # Merge results from all blocks using new LLM schema
    information = merge_results([{"data": r} for r in all_results])

    
    print(f"\n✅ Information received from LLM: {len(information['people'])} unique people\n")



    return {
        "url": url,
        "title": soup.title.get_text(strip=True) if soup.title else None,
        "information": information,
        "base_links": list(set(base_links)),
        "external_links": list(set(external_links)),
    }
