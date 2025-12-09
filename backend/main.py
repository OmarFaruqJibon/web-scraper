# main.py
import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
from db import get_db
from multiprocessing import Process
from crawler import start_async_crawl

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
