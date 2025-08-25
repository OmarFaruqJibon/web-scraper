import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

# ---------- MongoDB Setup ----------
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["scraperdb"]
scraperdb_collection = db["data"]

# ---------- Pydantic Models ----------
class Data(BaseModel):
    url: str
    selectedOptions: List[str]
    description: str

class DataCollections(BaseModel):
    dataCollections: List[Data]

# ---------- FastAPI App ----------
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
    return {"message": "Backend Server is running"}

# @app.get("/data", response_model=DataCollections)
# def get_data():
#     datas = list(scraperdb_collection.find({}, {"_id": 0}))
#     return DataCollections(dataCollections=datas)



@app.get("/data", response_model=DataCollections)
def get_data():
    datas = list(scraperdb_collection.find({}, {"_id": 0}))

    # Ensure selectedOptions is always a list
    for d in datas:
        if isinstance(d.get("selectedOptions"), str):
            d["selectedOptions"] = [d["selectedOptions"]]

    return DataCollections(dataCollections=datas)


@app.post("/data", response_model=Data)
def add_data(data: Data):
    # scraperdb_collection.insert_one(data.dict())
    scraperdb_collection.insert_one(data.model_dump())

    return data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
