# scraper.py
import time
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from llm_extractor import process_with_ollama, merge_results

# -------- Helper: DOM stabilization --------
def wait_for_stable_dom(page, timeout=15, stable_time=1.0, poll=0.4):
    end_time = time.time() + timeout
    last_html = None
    stable_start = None
    while time.time() < end_time:
        html = page.content()
        if last_html is not None and html == last_html:
            if stable_start is None:
                stable_start = time.time()
            elif time.time() - stable_start >= stable_time:
                return True
        else:
            stable_start = None
        last_html = html
        time.sleep(poll)
    return False

# -------- Helper: Auto-scroll for lazy-loading --------
def auto_scroll(page, pause=1.0, max_attempts=20):
    try:
        last_height = page.evaluate("() => document.body.scrollHeight")
    except Exception:
        return
    for _ in range(max_attempts):
        page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(pause)
        try:
            new_height = page.evaluate("() => document.body.scrollHeight")
        except Exception:
            break
        if new_height == last_height:
            break
        last_height = new_height
    print("✅ Finished auto-scrolling\n")


def extract_text_with_media(soup):
    #Collect visible text and inline images/links, while attempting to skip menus, navs, headers, and hidden elements.
    parts = []
    if not soup.body:
        return str(soup)

    # Remove elements commonly not part of main content
    for tag in soup(["script", "style", "header", "footer", "nav", "noscript", "template", "svg"]):
        tag.decompose()

    # Remove hidden via inline styles
    def is_visible(el):
        if getattr(el, "attrs", None):
            style = el.attrs.get("style", "") or ""
            if "display:none" in style.replace(" ", "").lower():
                return False
            if el.has_attr("aria-hidden") and el["aria-hidden"].lower() == "true":
                return False
        return True

    # iterate through block-level textual content
    for elem in soup.find_all(text=True):
        parent = elem.parent
        if parent and parent.name:
            # skip script/style already removed
            if not is_visible(parent):
                continue
            text = elem.strip()
            if text:
                parts.append(text)

    # Add images and anchors separately (simple approach)
    for img in soup.find_all("img"):
        src = img.get("src", "")
        alt = img.get("alt", "")
        parts.append(f"<img src='{src}' alt='{alt}'>")
    for a in soup.find_all("a", href=True):
        text = a.get_text(strip=True) or ""
        href = a["href"]
        parts.append(f"<a href='{href}'>{text}</a>")

    return " ".join(parts)


# -------- Helper: Chunking --------
def chunk_text(text: str, chunk_size=5000, overlap=500):
    chunks, start = [], 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(f"<block>\n{chunk}\n</block>")
        start += chunk_size - overlap
    return chunks


# -------- Scraper Function --------
def scrape_website(url: str, max_scrape_time: int = 120):

    print(f"\n\n🔎 Scraping: {url} ...\n\n")
    start_time = time.time()
    page_source = ""
    browser = None

    try:
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
                # page.goto with per-navigation timeout but we guard total time below
                page.goto(url, timeout=60000)
                print("✅ Browser navigated")

                # wait for DOM content, then try networkidle but fallback to stable DOM check
                try:
                    page.wait_for_load_state("domcontentloaded", timeout=15000)
                    try:
                        page.wait_for_load_state("networkidle", timeout=10000)
                    except Exception:
                        print("⚠️ networkidle not reached, falling back to stable DOM")
                    wait_for_stable_dom(page, timeout=10, stable_time=0.8)
                except Exception as e:
                    print(f"⚠️ Playwright load issue: {e}")

                # Only auto-scroll if page is scrollable (avoid wasting time)
                try:
                    scrollable = page.evaluate("() => document.body.scrollHeight > window.innerHeight")
                except Exception:
                    scrollable = False

                if scrollable:
                    auto_scroll(page, pause=0.8, max_attempts=20)

                # final stabilization
                wait_for_stable_dom(page, timeout=8, stable_time=0.6)

                page_source = page.content()

            except Exception as e:
                print(f"⚠️ Playwright error on {url}: {e}")
                return {"error": f"Playwright error: {e}", "url": url}
            finally:
                try:
                    browser.close()
                except Exception:
                    pass

    except Exception as e:
        # Playwright could not start
        print(f"⚠️ Playwright launcher error on {url}: {e}")
        try:
            if browser:
                browser.close()
        except Exception:
            pass
        return {"error": f"Playwright launcher error: {e}", "url": url}

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

    # Extract visible text and media
    body_text = extract_text_with_media(soup)

    blocks = chunk_text(body_text, chunk_size=5000, overlap=500)
    print(f"\n✅ Body split into {len(blocks)} blocks\n")

    # --- Send to Ollama in batches ---
    all_results = []
    for i, block in enumerate(blocks, 1):
        print(f"🔹 Processing block {i}/{len(blocks)}")
        print(block)
        res = process_with_ollama(block)
        if res and res.get("data"):
            all_results.append(res["data"])

    # Merge results from all blocks using new LLM schema
    information = merge_results([{"data": r} for r in all_results])

    print(f"\n✅ Information received from LLM: {len(information.get('people', []))} unique people\n")

    return {
        "url": url,
        "title": soup.title.get_text(strip=True) if soup.title else None,
        "information": information,
        "base_links": list(set(base_links)),
        "external_links": list(set(external_links)),
    }
