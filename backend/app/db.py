from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()  # para cargar .env
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "mr_sandwich")

client = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB]
    print("✅ Conectado a MongoDB")

async def close_db():
    global client
    if client:
        client.close()
        print("❌ Conexión a MongoDB cerrada")
