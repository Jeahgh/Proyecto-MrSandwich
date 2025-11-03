from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv() 
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "mr_sandwich")

# Conexión directa, como en el ejemplo del resumen 
client = AsyncIOMotorClient(MONGO_URI)

# Exponemos la base de datos 'mr_sandwich' para que
# los routers la puedan importar y usar.
db = client[MONGO_DB]

print("Conexión a MongoDB establecida.")