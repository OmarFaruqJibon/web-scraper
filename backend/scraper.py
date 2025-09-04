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


# -------- Ollama API Function --------
def send_to_ollama(text: str, retries: int = 1):
    """Send HTML to Ollama for information extraction and return structured JSON."""

    ollama_url = "http://localhost:11434/api/generate"
    prompt = f"""
            You are an information extraction system.

            The input is cleaned HTML text where <img> tags are kept.

            Your task:
            - Extract a list of people mentioned in the text.
            - For each person, include these fields:
            - name (string)
            - email (array of strings, [] if none found)
            - phone (array of strings, [] if none found)
            - location (string, "" if none found)
            - image (URL from <img> tag if related to that person)
            - description (a well-written summary about the person that combines all available details: roles, contact information, achievements, affiliations, titles, expertise, education, publications, responsibilities, or any other personal/professional context found in the text. If only limited info is available, still write a complete sentence describing them with what is known)

            Rules:
            - If a field is missing, use an empty string "" (do not skip it).
            - The description field must capture any additional details, explanations, or contextual information found near that person.
            - Only return valid JSON. Do not include explanations, notes, or text outside of the JSON.
            - Always return a JSON array, even if only one person is found.

            Example output:
            [
            {{
                "name": "John Doe",
                "email": ["john@example.com", "john2@example.com"],
                "phone": ["+880 182232584", "01487258961"],
                "location": "New York, USA",
                "image": "https://example.com/john.jpg",
                "description": "This is description"
            }},
            {{
                "name": "Jane Smith",
                "email": ["jane@example.com"],
                "phone": [],
                "location": "London, UK",
                "image": "",
                "description": ""
            }},
            {{
                "name": "Akhash Dev",
                "email": []
                "phone": ["+880 182232584", "01487258961"]
                "location": "New York, USA",
                "image": "https://example.com/john.jpg",
                "description": ""
            }},
            {{
                "name": "Jane Smith",
                "email": ["jane@example.com"],
                "phone": [],
                "location": "London, UK",
                "image": "",
                "description": ""
            }},
            {{
                "name": "Alex",
                "email": [],
                "phone": ["+8801742-189270"],
                "location": "",
                "image": "",
                "description": ""
            }}
            ]       
            
        HTML:
        {text}
    """

    payload = {
        "model": "llama3:latest",
        "prompt": prompt,
        "stream": False
    }

    for attempt in range(retries):
        try:
            print("\n🔃 Ollama loading\n")
            start_time = time.time()

            response = requests.post(ollama_url, json=payload, timeout=1800)
            response.raise_for_status()

            elapsed = time.time() - start_time
            print(f"\n⚡ Ollama Loaded. Extraction took {elapsed:.2f} seconds\n")

            data = response.json()
            raw_text = data.get("response", "").strip()
            print(raw_text)  # Debug raw response

            # --- First: try direct JSON parsing ---
            try:
                parsed = json.loads(raw_text)
                return {"data": parsed, "raw": raw_text}
            except json.JSONDecodeError:
                pass  # fallback to regex

            # --- Second: regex fallback ---
            matches = re.findall(r"\[.*\]", raw_text, re.DOTALL)
            if matches:
                try:
                    parsed = json.loads(matches[0])
                    return {"data": parsed, "raw": raw_text}
                except json.JSONDecodeError:
                    return {"data": [], "raw": raw_text}

            # --- Last resort ---
            return {"data": [], "raw": raw_text}

        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            print(f"Ollama error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return {"data": [], "raw": ""}



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
        "title": soup.title.string if soup.title else None,
        "information": information,
        "base_links": list(set(base_links)),
        "external_links": list(set(external_links)),
    }
