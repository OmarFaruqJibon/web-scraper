import uvicorn
from fastapi import FastAPI, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Import crawler
from crawler import crawl_website, crawl_progress

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["scraperdb"]
scraperdb_collection = db["data"]

class Data(BaseModel):
    url: str

app = FastAPI()

# ==========================
# API ROUTES
# ==========================
@app.get("/api/")
def get_root():
    return {"Message": "Backend Server is running"}

@app.get("/api/data")
def get_data():
    datas = list(scraperdb_collection.find({}, {"_id": 0}))
    return {"dataCollections": datas}

@app.get("/api/progress")
def get_progress():
    return crawl_progress

@app.post("/api/crawl")
def start_crawl(data: Data, background_tasks: BackgroundTasks):
    background_tasks.add_task(crawl_website, data.url)
    return {"message": f"Crawling started for {data.url}"}

# ==========================
# Serve React build (Vite `dist/` folder)
# ==========================
react_dist_dir = os.path.join(os.path.dirname(__file__), "frontend", "dist")

if os.path.exists(react_dist_dir):
    app.mount("/", StaticFiles(directory=react_dist_dir, html=True), name="frontend")

# ==========================
# Entry point
# ==========================
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
