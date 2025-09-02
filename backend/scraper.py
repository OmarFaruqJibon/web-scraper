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
        You are an expert in extracting structured data from given HTML.

            Instructions:
            - Extract each person's information from the HTML.
            - Extract only:
            - "name" (mandatory if found)
            - "email" (if available, else null)
            - "phone" (if available, else null)
            - "location" (if available, else null)
            - "image" (profile-related image URL from the <img> tag)

            Output rules:
            - The output must be ONLY a valid JSON array of dictionaries.
            - Do not explain, do not describe, do not use markdown.
            - Do not include extra text before or after the JSON.
            - Every object must have all 5 keys, even if values are null.

            Example output:
            [
            {{
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+1-555-1234",
                "location": "New York, USA",
                "image": "https://example.com/john.jpg"
            }},
            {{
                "name": "Jane Smith",
                "email": null,
                "phone": null,
                "location": "London, UK",
                "image": null
            }}
            ]

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
            
            print(f"\n⚡ Ollama Loaded. Extraction took {elapsed:.2f} seconds\n")
            
            
            
        except requests.exceptions.RequestException as e:
            print(f"Ollama request failed (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return []
        

        data = response.json()
        raw_text = data.get("response", "").strip()
        print(raw_text)

        
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

def send_to_ollama(text: str, retries: int = 1):
    """Send HTML to Ollama for information extraction and return structured JSON."""

    ollama_url = "http://localhost:11434/api/generate"

    # --- Compact prompt (system-style) ---
    prompt = f"""
            You are an information extraction system.

            The input is cleaned HTML text where <img> tags are kept.

            Your task:
            - Extract a list of people mentioned in the text.
            - For each person, include these fields:
            - name
            - title
            - email
            - phone
            - location
            - image (URL from <img> tag if related to that person)
            - description (a string with any extra information, notes, or context about this person)

            Rules:
            - If a field is missing, use an empty string "" (do not skip it).
            - The description field must capture any additional details, explanations, or contextual information found near that person.
            - Only return valid JSON. Do not include explanations, notes, or text outside of the JSON.
            - Always return a JSON array, even if only one person is found.

            Example output:
            [
            {{
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+1-555-1234",
                "location": "New York, USA",
                "image": "https://example.com/john.jpg",
                "description": "This is description"
            }},
            {{
                "name": "Jane Smith",
                "email": "",
                "phone": "",
                "location": "London, UK",
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
            print("\n-----Ollama loading-----\n")
            start_time = time.time()

            response = requests.post(ollama_url, json=payload, timeout=3600)
            response.raise_for_status()

            elapsed = time.time() - start_time
            print(f"\n⚡ Ollama Loaded. Extraction took {elapsed:.2f} seconds\n")

            data = response.json()
            raw_text = data.get("response", "").strip()
            print(raw_text)  # Debug raw response


            # --- Strict JSON extraction ---
            matches = re.findall(r"\[.*?\]", raw_text, re.DOTALL)
            if matches:
                try:
                    parsed = json.loads(matches[0])
                    return {"data": parsed, "raw": raw_text}
                except json.JSONDecodeError:
                    return {"data": [], "raw": raw_text}

            # No JSON found → return raw string
            return {"data": [], "raw": raw_text}

        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            print(f"Ollama error (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(1)
                continue
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
        
        soup_for_base_url = BeautifulSoup(page_source, "html.parser")
        
        print("\n-----Page parsed-----\n")

        # Clean HTML (remove scripts/styles)
        # for tag in soup(["script", "style", "header", "footer", "nav"]):
        #     tag.decompose()

        # clean_html = str(soup)
        
        # if soup.body:
        #     body_text = soup.body.get_text(separator=" ", strip=True)
            
            
        # else:
        #     body_text = str(soup)
            
        
        
        for tag in soup(["script", "style", "header", "footer", "nav"]):
            tag.decompose()

        if soup.body:
            body_text = ""
            for elem in soup.body.descendants:
                if elem.name == "img":
                    body_text += str(elem) + " "
                elif elem.string and elem.string.strip():
                    body_text += elem.string.strip() + " "
        else:
            body_text = str(soup)
        
        
        # print(clean_html)
        print("\n-----Page body prettified-----\n")

        # --- Send HTML to Ollama ---
        # information = send_html_to_ollama(body_text)
        # information = ""
        
        print("\n----------------------------Another prompt-------------------------------\n")
        
        
        information = send_to_ollama(body_text)
        # info = ""
        
        
        print("\n-----Information get from Ollama-----\n")

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

        # --- Extract Image URLs ---
        # images = [urljoin(url, img["src"]) for img in soup.find_all("img", src=True)]

        return {
            "url": url,
            "title": soup.title.string if soup.title else None,
            "information": information,
            # "images": list(set(images)),
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
    
    
