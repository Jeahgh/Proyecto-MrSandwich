from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv() 
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "mr_sandwich")

client = AsyncIOMotorClient(MONGO_URI)


db = client[MONGO_DB]
print("Conexión a MongoDB establecida.")