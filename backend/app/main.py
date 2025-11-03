from fastapi import FastAPI
from routers import products, users, orders

app = FastAPI(title="Mr.Sandwich", version="1.0.0")


app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])

@app.get("/")
async def root():
    return {"message": "Mr. Sandwich API funcionando correctamente"}