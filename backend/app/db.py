from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde el archivo .env
load_dotenv() 
# Configuración de la conexión a MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "mr_sandwich")
# Crear el cliente de MongoDB
client = AsyncIOMotorClient(MONGO_URI)

# Seleccionar la base de datos
db = client[MONGO_DB]
print("Conexión a MongoDB establecida.")