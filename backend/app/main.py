from fastapi import FastAPI
from routers import products, users, orders
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title="Mr.Sandwich", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])

@app.get("/")
async def root():
    return {"message": "Mr. Sandwich API funcionando correctamente"}