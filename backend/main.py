import uvicorn
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Import crawler
from crawler import crawl_website  

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["scraperdb"]       
scraperdb_collection = db["data"]  

class Data(BaseModel):
    url: str

app = FastAPI()

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def get_root():
    return {"Message": "Backend Server is running"}


@app.get("/data")
def get_data():
    datas = list(scraperdb_collection.find({}, {"_id": 0})) 
    return {"dataCollections": datas}


@app.post("/crawl")
def start_crawl(data: Data, background_tasks: BackgroundTasks):
    background_tasks.add_task(crawl_website, data.url)
    return {"message": f"Crawling started for {data.url}"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
