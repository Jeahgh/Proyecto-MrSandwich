from fastapi import FastAPI
from routers import products, users, orders

# 1. Creamos la app (¡el inicio de todo!) [cite: 155-156]
app = FastAPI(title="Mr.Sandwich", version="1.0.0")

# 2. (¡Quitamos CORS y eventos de startup/shutdown!)
#    Esto lo hace mucho más limpio para empezar.

# 3. Registramos los routers [cite: 219]
#    Le decimos a la app principal dónde están las rutas.
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])

@app.get("/")
async def root():
    return {"message": "Mr. Sandwich API funcionando correctamente 🍞"}