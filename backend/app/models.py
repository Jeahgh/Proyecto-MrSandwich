from pydantic import BaseModel
from typing import Optional, List
from pydantic import BaseModel, EmailStr



class Product(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    category: Optional[str] = None

class User(BaseModel):
    email: str
    full_name: str
    password: Optional[str] = None

class Order(BaseModel):
    user_id: str
    items: List[str]  
    total: float
    status: str = "pending"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str