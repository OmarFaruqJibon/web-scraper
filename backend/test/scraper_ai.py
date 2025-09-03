import re
import html
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

import spacy
from nltk.corpus import names as nltk_names
from fuzzywuzzy import fuzz

# --- Load spaCy ---
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# --- Load name dictionary ---
try:
    first_names = set(nltk_names.words("male.txt") + nltk_names.words("female.txt"))
except:
    import nltk
    nltk.download("names")
    first_names = set(nltk_names.words("male.txt") + nltk_names.words("female.txt"))

# --- Helper: clean & validate person names ---
def clean_and_validate_names(all_names):
    false_positives = {
        "Privacy Policy", "Terms of Service", "Contact Us", "About Us",
        "Sign In", "Log In", "Sign Up", "Home", "Products", "Services",
        "Blog", "News", "Careers", "Support", "Help", "FAQ"
    }

    cleaned = set()
    for name in all_names:
        name = name.strip()

        # --- Basic filters ---
        if not name or name in false_positives:
            continue
        if len(name) < 3 or len(name) > 50:
            continue
        if name.isupper():  # looks like menu text
            continue
        if any(word.lower() in ["login", "signup", "subscribe", "cookie", "policy"] for word in name.split()):
            continue

        # --- Dictionary + fuzzy check ---
        tokens = name.split()
        valid = False
        for token in tokens:
            for fname in first_names:
                if fuzz.ratio(token.lower(), fname.lower()) >= 90:  # allow near-match
                    valid = True
                    break
            if valid:
                break

        if valid:
            cleaned.add(name)

    return sorted(cleaned)


# --- Extract names with multiple strategies ---
def extract_names_combined(soup, text: str) -> list:
    all_names = set()

    # 1. spaCy NER
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            candidate = ent.text.strip()
            if 2 <= len(candidate.split()) <= 4:
                all_names.add(candidate)

    # 2. Regex fallback (First Last)
    regex_names = re.findall(r"\b[A-Z][a-z]+ [A-Z][a-z]+\b", text)
    for rn in regex_names:
        if 2 <= len(rn.split()) <= 3:
            all_names.add(rn)

    # 3. From staff/team/author/profile sections
    for selector in [
        '[class*="team"]', '[class*="staff"]', '[class*="author"]', '[class*="profile"]'
    ]:
        for elem in soup.select(selector):
            elem_text = elem.get_text(" ", strip=True)
            if 2 <= len(elem_text.split()) <= 4:
                all_names.add(elem_text)

    # --- Final cleaning ---
    return clean_and_validate_names(all_names)


# --- Main scraper ---
def scrape_website(url: str):
    try:
        # Selenium options
        options = Options()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--remote-debugging-port=9222")

        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()), options=options
        )
        driver.get(url)
        page_source = driver.page_source
        driver.quit()

        soup = BeautifulSoup(page_source, "html.parser")

        # Remove scripts/styles
        for script in soup(["script", "style"]):
            script.decompose()

        text = soup.get_text(" ", strip=True)

        # --- Emails ---
        emails_text = re.findall(
            r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html.unescape(text)
        )
        emails_mailto = [
            a["href"].split("mailto:")[1].split("?")[0].strip()
            for a in soup.find_all("a", href=True)
            if a["href"].lower().startswith("mailto:")
        ]
        emails = list(set([e.lower() for e in emails_text + emails_mailto]))

        # --- Phones ---
        raw_phones = re.findall(r"(\+?\d[\d\s\-\(\)]{7,}\d)", text)
        normalized_map = {}
        for phone in raw_phones:
            norm = re.sub(r"[()\s\-]", "", phone)
            norm = re.sub(r"^\+{2,}", "+", norm)
            if norm not in normalized_map:
                cleaned_display = re.sub(r"[()\s\-]+", " ", phone).strip()
                normalized_map[norm] = cleaned_display
        phones = list(normalized_map.values())

        # --- Names ---
        names = extract_names_combined(soup, text)

        # --- Links ---
        base_domain = urlparse(url).netloc
        base_links, external_links = [], []
        for a in soup.find_all("a", href=True):
            abs_link = urljoin(url, a["href"])
            link_domain = urlparse(abs_link).netloc
            if (
                link_domain
                and link_domain != base_domain
                and not abs_link.startswith("mailto:")
                and not abs_link.startswith("tel:")
            ):
                external_links.append(abs_link)
            if link_domain == base_domain:
                base_links.append(abs_link)

        # --- Images ---
        images = [urljoin(url, img["src"]) for img in soup.find_all("img", src=True)]

        title = soup.title.string if soup.title else None

        return {
            "url": url,
            "title": title,
            "emails": emails,
            "phones": phones,
            "names": names,
            "external_links": list(set(external_links)),
            "base_links": list(set(base_links)),
            "images": list(set(images)),
        }

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {"error": str(e), "url": url}


# --- Run standalone ---
if __name__ == "__main__":
    test_url = "https://example.com"
    data = scrape_website(test_url)
    from pprint import pprint
    pprint(data)
