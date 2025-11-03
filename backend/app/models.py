from pydantic import BaseModel
from typing import Optional, List

# Modelo simple, como en tu resumen .
# Define solo los campos que el usuario debe enviar al CREAR.
# No nos preocupamos por el 'id' aquí.

class Product(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    category: Optional[str] = None

class User(BaseModel):
    email: str
    full_name: Optional[str] = None
    password: Optional[str] = None

class Order(BaseModel):
    user_id: str
    items: List[str]  # Suponemos que es una lista de IDs de productos
    total: float
    status: str = "pending"