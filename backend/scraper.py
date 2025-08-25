import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse

def scrape_website(url: str):
    try:
        response = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        response.encoding = "utf-8"
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        text = soup.get_text(" ", strip=True)

        # --- Extract emails from plain text ---
        emails_text = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", text)

        # --- Extract emails from "mailto:" links ---
        emails_mailto = [
            a["href"].replace("mailto:", "")
            for a in soup.find_all("a", href=True)
            if a["href"].startswith("mailto:")
        ]

        # Merge and deduplicate
        emails = list(set(emails_text + emails_mailto))

        # --- Extract phone numbers (basic regex) ---
        phones = list(set(re.findall(r"(\+?\d[\d\s\-\(\)]{7,}\d)", text)))

        # --- Extract external links only ---
        base_domain = urlparse(url).netloc
        links = []
        for a in soup.find_all("a", href=True):
            abs_link = urljoin(url, a["href"])
            link_domain = urlparse(abs_link).netloc
            if link_domain and link_domain != base_domain and not abs_link.startswith("mailto:"):
                links.append(abs_link)

        # --- Extract images (all, keep absolute URLs) ---
        images = [urljoin(url, img["src"]) for img in soup.find_all("img", src=True)]

        # --- Basic title ---
        title = soup.title.string if soup.title else None

        return {
            "url": url,
            "title": title,
            "emails": emails,
            "phones": phones,
            "links": list(set(links)),
            "images": list(set(images)),
        }

    except Exception as e:
        return {"error": str(e)}
