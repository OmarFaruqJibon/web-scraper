import requests
import os

SERPAPI_KEY = os.getenv("SERPAPI_KEY")

def serpapi_search(query: str, count: int = 10):
    url = "https://serpapi.com/search"
    params = {
        "engine": "google",
        "q": query,
        "api_key": SERPAPI_KEY,
        "num": count,
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = []
    organic = data.get("organic_results", [])

    for item in organic:
        results.append({
            "title": item.get("title"),
            "url": item.get("link"),
            "snippet": item.get("snippet"),
        })

    return results[:count]
