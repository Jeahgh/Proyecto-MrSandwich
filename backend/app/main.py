from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import products, users, orders
from .db import connect_db, close_db

app = FastAPI(title="Mr. Sandwich API (MongoDB Version)")

# Permitir CORS (para luego conectar frontend)
origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Conexión a BD al iniciar
@app.on_event("startup")
async def startup_db():
    await connect_db()

@app.on_event("shutdown")
async def shutdown_db():
    await close_db()

# Registrar routers
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])

@app.get("/")
async def root():
    return {"message": "Mr. Sandwich API funcionando correctamente 🍞"}
