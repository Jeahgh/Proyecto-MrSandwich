from fastapi import FastAPI
from routers import products, users, orders, messages, reports
from fastapi.middleware.cors import CORSMiddleware


# Crear la instancia de la aplicación FastAPI
app = FastAPI(title="Mr.Sandwich", version="1.0.0")

# Configurar CORS para permitir solicitudes desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers de los diferentes módulos
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])

