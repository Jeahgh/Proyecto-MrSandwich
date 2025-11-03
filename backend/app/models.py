from pydantic import BaseModel
from typing import Optional, List



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
    items: List[str]  
    total: float
    status: str = "pending"