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


para = """When the annual community development fair was announced in Brookhaven, the organizers wanted to highlight the stories of individuals who had made a lasting impact in their neighborhoods. One of the first people invited to speak was Emily Carter, a local teacher who had dedicated over twenty years to early childhood education. She could be reached easily by her colleagues and students parents through her email emily.carter@gmail.com
 or by phone at (555) 101-2233. Emily lived in Springfield, Illinois, and was known for her warm personality and innovative teaching strategies that made learning fun for children.

Another featured guest was Daniel Thompson, a small business owner who had successfully launched a local bakery after years of working as a pastry chef in different cities. Daniel, whose contact details included daniel.thompson@yahoo.com
 and 01742189270, lived in Madison, Wisconsin, where he also volunteered with a local food bank. His journey from struggling worker to successful entrepreneur was inspiring for many young people at the event, especially because he emphasized community values over profit.

During the fair, attendees also had the chance to meet Sophia Martinez, a young software developer who built educational mobile apps for children. Sophia, who often shared her story with university students, left her contact information on the pamphlets distributed at the fair: sophia.martinez@outlook.com
 and +8801785-159687. Living in Austin, Texas, Sophia believed in using technology to bridge learning gaps in underprivileged areas. Her apps were already being used in several schools, and she was eager to expand them to more communities.

In the section dedicated to healthcare, Michael Lee, a community health worker, spoke passionately about the importance of preventive care and awareness. Michael lived in Seattle, Washington, and many people reached out to him through his professional email michael.lee@hotmail.com
 or by calling +9741258746. His work focused on organizing local health camps where residents could receive free check-ups and advice on nutrition and fitness. Michael’s approachable manner made him a trusted figure, and several attendees later mentioned that his talk was the most practical and helpful of the day.

Finally, the fair closed with remarks from Rachel Johnson, a nonprofit leader who managed programs that supported homeless families. Rachel, who resided in Denver, Colorado, shared her journey of establishing a shelter that offered not just temporary housing but also counseling and job training. She could be contacted via rachel.johnson@example.com
 or at +880 1887-715152. Her emphasis on compassion and sustainability left a lasting impression on the audience, many of whom pledged to volunteer or donate to her cause.

By the end of the fair, the audience realized that the strength of a community came from diverse individuals—teachers, business owners, developers, health workers, and nonprofit leaders—all of whom played unique roles in shaping the society they wanted to live in."""


# -------- Ollama API Function --------
def send_html_to_ollama(text: str, retries: int = 2):
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
      }}
    ]
    
    Do not explain anything. Just give me the JSON array or result.
    
    Text:
    {text}
    """

    # headers = {"Content-Type": "application/json"}

    payload = {
        "model": "deepseek-r1:8b",
        "prompt": prompt,
        "stream": False
    }

    for attempt in range(retries):
        response = requests.post(ollama_url, json=payload)

        if not response.ok:
            if attempt < retries - 1:
                time.sleep(1)  
                continue
            raise RuntimeError(f"{response.status_code} error: {response.text}")

        data = response.json()
        # print(data)
        raw_text = data.get("response", "").strip()
        
        print("\n\n -----------OUTPUT FROM OLLAMA-------------\n\n")
        print(raw_text)
        print("\n\n -----------------OUTPUT FROM OLLAMA-----------\n\n")
        

        # --- Try to extract valid JSON from the model output ---
        try:
            # Extract JSON array if extra text is present
            json_match = re.search(r"\[.*\]", raw_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            else:
                return []
        except json.JSONDecodeError:
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return []  # fallback → always return a list

    return []


# -------- Scraper Function --------
def scrape_website(url: str):
    """Scrape website, extract information, links, and images."""

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
        driver.get(url)
        page_source = driver.page_source
        driver.quit()

        # --- Parse with BeautifulSoup ---
        soup = BeautifulSoup(page_source, "html.parser")

        # Clean HTML (remove scripts/styles)
        for script in soup(["script", "style"]):
            script.decompose()

        clean_html = str(soup)
        


        # --- Send HTML to Ollama ---
        information = send_html_to_ollama(clean_html)
        # information = send_html_to_ollama(para)

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
if __name__ == "__main__":
    test_url = "https://duet.ac.bd/department/cse/ex-faculty-member"
    result = scrape_website(test_url)
    print(json.dumps(result, indent=2))
    
    
