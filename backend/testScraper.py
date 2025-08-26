import re
import html
from urllib.parse import urljoin, urlparse

import phonenumbers
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def scrape_test(url: str):
    try:
        # --- Setup Selenium (headless Chrome) ---
        options = Options()
        options.add_argument("--headless")  # run in background
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        driver = webdriver.Chrome(options=options)

        # --- Load page ---
        driver.get(url)
        page_source = driver.page_source
        driver.quit()

        soup = BeautifulSoup(page_source, "html.parser")

        # --- Extract plain text for regex search ---
        text = soup.get_text(" ", strip=True)

        # --- Extract emails from plain text (robust regex + unescape HTML) ---
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

        # --- Merge, deduplicate, normalize to lowercase ---
        emails = list(set([e.lower() for e in emails_text + emails_mailto]))

        # --- Extract phone numbers from text ---
        phones = []
        for match in phonenumbers.PhoneNumberMatcher(text, None):  # None = all regions
            phones.append(
                phonenumbers.format_number(
                    match.number, phonenumbers.PhoneNumberFormat.E164
                )
            )

        # --- Extract phone numbers from "tel:" links ---
        for a in soup.find_all("a", href=True):
            if a["href"].lower().startswith("tel:"):
                raw_number = a["href"].split("tel:")[1].split("?")[0].strip()
                try:
                    parsed = phonenumbers.parse(raw_number, None)
                    if phonenumbers.is_possible_number(parsed):
                        phones.append(
                            phonenumbers.format_number(
                                parsed, phonenumbers.PhoneNumberFormat.E164
                            )
                        )
                except phonenumbers.NumberParseException:
                    continue

        phones = list(set(phones))  # deduplicate

        # --- Extract external links only ---
        base_domain = urlparse(url).netloc
        links = []
        for a in soup.find_all("a", href=True):
            abs_link = urljoin(url, a["href"])
            link_domain = urlparse(abs_link).netloc
            if (
                link_domain
                and link_domain != base_domain
                and not abs_link.startswith("mailto:")
                and not abs_link.startswith("tel:")
            ):
                links.append(abs_link)

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
            "images": list(set(images)),
        }

    except Exception as e:
        return {"error": str(e)}
