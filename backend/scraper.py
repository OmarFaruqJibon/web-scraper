import time
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from llm_extructor import send_to_ollama


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


# -------- Scraper Function --------
def scrape_website(url: str):
    """Scrape website, extract information, links, and images using Playwright."""

    print(f"\n\n🔎 Scraping: {url} ...\n\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,  # Run headless browser
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
            # Load page
            page.goto(url, timeout=120000)  # 120 sec timeout
            print("✅ Browser launched\n")

            # Wait for network to be idle
            page.wait_for_load_state("networkidle", timeout=30000)
            print("✅ Document ready\n")

            # Wait until DOM stabilizes
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

    # Remove noise
    for tag in soup(["script", "style", "header", "footer", "nav"]):
        tag.decompose()

    # Extract body text + keep <img> tags inline
    if soup.body:
        body_text = soup.body.get_text(" ", strip=True)
        for img in soup.find_all("img"):
            body_text += f" <img src='{img.get('src', '')}' alt='{img.get('alt', '')}'> "
    else:
        body_text = str(soup)

    print("\n✅ Body extracted\n")

    print(body_text)
    print("\n\n--------------------------\n\n")

    # --- Send to Ollama ---
    information = send_to_ollama(body_text)
    print("\n✅ Information received from Ollama\n")

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

    return {
        "url": url,
        "title": soup.title.string.strip() if soup.title else None,
        "information": information,
        "base_links": list(set(base_links)),
        "external_links": list(set(external_links)),
    }
