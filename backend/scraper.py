import requests
import re
import json
import time
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# -------- Ollama API Function --------
def send_html_to_ollama(text: str, retries: int = 1):
    """Send HTML to Ollama for information extraction and return structured JSON."""

    ollama_url = "http://localhost:11434/api/generate"

    # Truncate long HTML (to avoid hitting context limits)
    # if len(html_content) > 8000:
    #     html_content = html_content[:8000]

    prompt = f"""
        You are an expert in extracting data from given text.
        Extract the following information if available:

        Extract:
        - Name (mandatory if found)
        - Email (if available, else null)
        - Phone (if available, else null)
        - Location (if available, else null)

        Return ONLY a JSON array of dictionaries with keys:
        - "name"
        - "email"
        - "phone"
        - "location"

        If some fields are missing, still include them with null.
            
        Example:
        [
        {{
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1-555-1234",
            "location": "New York, USA"
        }},
        {{
            "name": "Jane Smith",
            "email": null,
            "phone": null,
            "location": "London, UK"
        }}
        ]

        Do not explain anything. Just give me the JSON array or result.

        Text:
        {text}
        """


    # headers = {"Content-Type": "application/json"}

    payload = {
        # "model": "deepseek-r1:8b",
        "model": "llama3:latest",
        "prompt": prompt,
        "stream": False
    }

    for attempt in range(retries):
        
        try:
            print("\n-----Ollama loading-----\n")
            
            start_time = time.time()   #  start timer
            response = requests.post(ollama_url, json=payload, timeout=3600)
            end_time = time.time()     #  end timer

            elapsed = end_time - start_time
            
            response.raise_for_status()
            
            print(f"\n⚡Ollama Loaded. Extraction took {elapsed:.2f} seconds\n")
            
            
            
        except requests.exceptions.RequestException as e:
            print(f"Ollama request failed (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return []
        

        data = response.json()
        raw_text = data.get("response", "").strip()

        
        # --- Try to extract valid JSON from the model output ---
        try:
            json_match = re.search(r"\[.*?\]", raw_text, re.DOTALL)
            if json_match:
                print(json.loads(json_match.group(0)))
                return json.loads(json_match.group(0))
            return []
        except json.JSONDecodeError:
            cleaned = raw_text.replace("\n", " ").replace("\t", " ")
            try:
                print(json.loads(cleaned))
                return json.loads(cleaned)
            except:
                return []
    return []


# -------- Scraper Function --------
def scrape_website(url: str):
    """Scrape website, extract information, links, and images."""
    
    print(f"\n\n🔎 Scraping: {url} ...")

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
        
        print("\n-----Page loaded-----\n")
        
        # driver.get(url)
        # page_source = driver.page_source
        # driver.quit()
        
        try:
            driver.get(url)
            page_source = driver.page_source
        except Exception as e:
            print(f"⚠️ Selenium error on {url}: {e}")
            return {"error": f"Selenium timeout: {e}", "url": url}
        finally:
            driver.quit()
        
        
        

        # --- Parse with BeautifulSoup ---
        soup = BeautifulSoup(page_source, "html.parser")
        
        print("\n-----Page parsed-----\n")

        # Clean HTML (remove scripts/styles)
        for tag in soup(["script", "style", "header", "footer", "nav"]):
            tag.decompose()

        # clean_html = str(soup)
        if soup.body:
            body_text = soup.body.get_text(separator=" ", strip=True)
        else:
            body_text = str(soup)
        
        print("\n-----Page body prettified-----\n")

        # --- Send HTML to Ollama ---
        information = send_html_to_ollama(body_text)
        
        print("\n-----Information get from Ollama-----\n")

        # --- Links Extraction ---
        base_domain = urlparse(url).netloc
        base_links, external_links = [], []

        for a in soup.find_all("a", href=True):
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

        # --- Extract Image URLs ---
        images = [urljoin(url, img["src"]) for img in soup.find_all("img", src=True)]

        return {
            "url": url,
            "title": soup.title.string if soup.title else None,
            "information": information,
            "images": list(set(images)),
            "base_links": list(set(base_links)),
            "external_links": list(set(external_links)),
        }

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {"error": str(e), "url": url}


# -------- Example Run --------
# if __name__ == "__main__":
#     test_url = "https://duet.ac.bd/department/cse/ex-faculty-member"
#     result = scrape_website(test_url)
#     print(json.dumps(result, indent=2))
    
    
