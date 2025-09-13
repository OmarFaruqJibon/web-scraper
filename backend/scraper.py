import requests
import re
import json
import time
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from llm_extructor import send_to_ollama


# -------- Ollama API Function --------




# -------- Helper: DOM stabilization --------
def wait_for_stable_dom(driver, timeout=30, stable_time=2):
    """Wait until DOM stops changing for a given stable_time (seconds)."""
    end_time = time.time() + timeout
    last_html = ""
    stable_start = None

    while time.time() < end_time:
        html = driver.page_source
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
    """Scrape website, extract information, links, and images."""
    
    print(f"\n\n🔎 Scraping: {url} ...\n\n")

    driver = None
    try:
        # --- Selenium setup ---
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--remote-debugging-port=9222")
        options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/117.0.0.0 Safari/537.36"
        )

        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()), options=options
        )
        
        driver.set_page_load_timeout(120)  # 2 min timeout for page load
        driver.get(url)
        print("✅ Browser launched\n")
        
        # Step 1: wait until document is fully loaded
        WebDriverWait(driver, 30).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        print("✅ Document ready\n")

        # Step 2: wait until DOM stabilizes (backend data finished loading)
        if wait_for_stable_dom(driver, timeout=30, stable_time=2):
            print("✅ DOM stabilized (data loaded)\n")
        else:
            print("⚠️ DOM may still be loading, continuing anyway\n")
        
        page_source = driver.page_source

    except Exception as e:
        print(f"⚠️ Selenium error on {url}: {e}")
        return {"error": f"Selenium error: {e}", "url": url}
    finally:
        if driver:
            driver.quit()
        
        
    # --- Parse with BeautifulSoup ---
    soup = BeautifulSoup(page_source, "html.parser")
    soup_for_base_url = BeautifulSoup(page_source, "html.parser")
    print("\n✅ Page parsed\n")
    
    # Remove noise
    for tag in soup(["script", "style", "header", "footer", "nav"]):
        tag.decompose()

    # Extract body text with inline <img> tags
    if soup.body:
        body_text = soup.body.get_text(" ", strip=True)
        for img in soup.find_all("img"):
            body_text += f" <img src='{img.get('src', '')}' alt='{img.get('alt', '')}'> "
    else:
        body_text = str(soup)

    print("\n✅ Body extracted\n")
    
    print(body_text)
    
    print("\n\n--------------------------\n\n")

    # --- Send HTML to Ollama ---
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








