import re
import html
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


def scrape_website(url: str):
    try:
        # --- Setup Selenium (headless Chrome) ---
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--remote-debugging-port=9222")

        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()), options=options
        )

        # --- Load page ---
        driver.get(url)
        page_source = driver.page_source
        driver.quit()

        soup = BeautifulSoup(page_source, "html.parser")

        # --- Extract plain text (keep original for emails) ---
        text = soup.get_text(" ", strip=True)

        # --- Extract emails from plain text ---
        emails_text = re.findall(
            r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
            html.unescape(text),
        )

        # --- Extract emails from "mailto:" links ---
        emails_mailto = []
        for a in soup.find_all("a", href=True):
            if a["href"].lower().startswith("mailto:"):
                address = a["href"].split("mailto:")[1].split("?")[0]
                emails_mailto.append(address.strip())

        # Merge & deduplicate emails
        emails = list(set([e.lower() for e in emails_text + emails_mailto]))
        
        # --- Extract phone numbers (regex + normalization) ---
        raw_phones = re.findall(r"(\+?\d[\d\s\-\(\)]{7,}\d)", text)

        normalized_map = {}
        for phone in raw_phones:
            # Normalize for deduplication: remove spaces, dashes, parentheses
            norm = re.sub(r"[()\s\-]", "", phone)

            # Fix multiple '+' at start
            norm = re.sub(r"^\+{2,}", "+", norm)

            if norm not in normalized_map:
                # Clean for display: unify spaces, remove parentheses/dashes
                cleaned_display = re.sub(r"[()\s\-]+", " ", phone).strip()
                normalized_map[norm] = cleaned_display

        phones = list(normalized_map.values())


        # --- Extract external links only ---
        base_domain = urlparse(url).netloc
        
        base_links = []
        links = []
        
        for a in soup.find_all("a", href=True):
            
            abs_link = urljoin(url, a["href"])
            link_domain = urlparse(abs_link).netloc
            
            # list of all external links
            if (
                link_domain
                and link_domain != base_domain
                and not abs_link.startswith("mailto:")
                and not abs_link.startswith("tel:")
            ):
                links.append(abs_link)
                
            # list of all domain links
            if(link_domain != abs_link):
                base_links.append(abs_link)
                
                
                
 

        # --- Extract images (absolute URLs) ---
        images = [urljoin(url, img["src"]) for img in soup.find_all("img", src=True)]

        # --- Page title ---
        title = soup.title.string if soup.title else None

        return {
            "url": url,
            "title": title,
            "emails": emails,
            "phones": phones,
            "links": list(set(links)),
            "base_links" : list(set(base_links)),
            "images": list(set(images)),
        }

    except Exception as e:
        return {"error": str(e)}
