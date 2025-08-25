# scraper.py
import requests
from bs4 import BeautifulSoup

def scrape_website(url: str):
    scraped_data = []   # list, not dict

    try:
        response = requests.get(url, timeout=10)
        response.encoding = "utf-8"
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        item_lists = soup.find_all("li", class_="top-ads-container--1Jeoq")

        for item in item_lists:
            title_tag = item.find("h2", class_="title--3yncE")
            price_tag = item.find("div", class_="price--3SnqI")

            if not title_tag or not price_tag:
                continue

            title = title_tag.get_text(strip=True)
            price = price_tag.get_text(strip=True)

            scraped_data.append({
                "title": title,
                "price": price
            })

    except Exception as e:
        return [{"error": str(e)}]

    return scraped_data
