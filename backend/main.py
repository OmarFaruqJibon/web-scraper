import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from bson import ObjectId

# import scraper function
from scraper import scrape_website  

load_dotenv()

# ---------- MongoDB Setup ----------
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["scraperdb"]       
scraperdb_collection = db["data"]  

# ---------- FastAPI Models ----------
class Data(BaseModel):
    url: str
    selectedOptions: List[str]
    description: str

app = FastAPI()

origins = [
    "http://localhost:5173"
]

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


@app.post("/data")
def add_data(data: Data):
    # Insert initial request
    inserted = scraperdb_collection.insert_one(data.dict())
    inserted_id = inserted.inserted_id

    # Call scraper
    scraped_data = scrape_website(data.url)

    # Force save as array
    if not isinstance(scraped_data, list):
        scraped_data = [scraped_data]

    scraperdb_collection.update_one(
        {"_id": ObjectId(inserted_id)},
        {"$set": {"scrapedData": scraped_data}}
    )

    return {
        "id": str(inserted_id),
        "url": data.url,
        "description": data.description,
        "selectedOptions": data.selectedOptions,
        "scrapedData": scraped_data
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
