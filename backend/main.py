# main.py
import uvicorn
from fastapi import FastAPI
from fastapi import Body
from typing import Optional
import requests
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
from db import get_db
from multiprocessing import Process
from crawler import start_async_crawl
from search_api import serpapi_search

class Data(BaseModel):
    url: str
    max_pages: int = 1
    max_depth: int = 10

app = FastAPI()

db = get_db()
progress_collection = db["progress"]

# ==========================
# API ROUTES
# ==========================
@app.get("/api/")


def get_root():
    return {"Message": "Backend Server is running"}

@app.get("/api/data")


def get_data():
    datas = list(db["data"].find({}, {"_id": 0}))
    return {"dataCollections": datas}

@app.get("/api/progress")


def get_progress():
    docs = list(progress_collection.find({}, {"_id": 0}))
    return {"progress": docs}

@app.post("/api/crawl")
def start_crawl(data: Data):
    job_id = start_async_crawl(
        data.url,
        max_pages=data.max_pages,
        max_depth=data.max_depth
    )
    return {"message": f"Crawling started for {data.url}", "job_id": job_id}



# ==========================================
# /api/search —
# ========================================== 

# ==========================================
# /api/search-and-crawl
# ==========================================
@app.post("/api/search-and-crawl")
def search_and_crawl(
    query: str = Body(..., embed=True),
    count: int = Body(10, embed=True),
    max_pages: int = Body(1, embed=True),
    max_depth: int = Body(5, embed=True)
):

    # 1. SerpAPI search
    results = serpapi_search(query, count=count)

    if not results:
        return {"error": "No results found"}

    urls = [item["url"] for item in results if item.get("url")]

    if not urls:
        return {"error": "Search returned no URLs"}

    # 2. Start crawl jobs
    job_ids = []
    for url in urls:
        job_id = start_async_crawl(url, max_pages=max_pages, max_depth=max_depth)
        job_ids.append({"url": url, "job_id": job_id})

    return {
        "message": f"Started crawl for {len(job_ids)} URLs",
        "jobs": job_ids
    }



def start_crawl(data: Data):
    job_id = start_async_crawl(data.url, max_pages=data.max_pages, max_depth=data.max_depth)
    return {"message": f"Crawling started for {data.url}", "job_id": job_id}

# ==========================
# Serve React build (Vite dist/ folder)
# ==========================
react_dist_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")


if os.path.exists(react_dist_dir):
    app.mount("/", StaticFiles(directory=react_dist_dir, html=True), name="frontend")

# ==========================
# Entry point
# ==========================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
