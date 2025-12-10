import requests

SERPAPI_KEY = "5e734efbd9ea7ea3d3dd050ffdba29b926974c3b02b62c3fb82c2789203229df"

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
