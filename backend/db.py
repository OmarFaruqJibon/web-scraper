# db.py
from pymongo import MongoClient, ASCENDING
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI") or "mongodb://localhost:27017"
_client = None
_db = None


def get_client():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    return _client


def get_db():
    global _db
    if _db is None:
        _db = get_client()["scraperdb"]
        # Ensure indexes
        try:
            _db["data"].create_index([("url", ASCENDING)], unique=True, background=True)
            _db["progress"].create_index([("job_id", ASCENDING)], unique=True, background=True)
        except Exception:
            # If index creation fails (permissions, already exists) we continue
            pass
    return _db
