from pydantic import BaseModel, EmailStr
from typing import Optional, List

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
    role: str = "cliente"

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
    role: str

class EmailRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserUpdate(BaseModel):
    full_name: str

class Message(BaseModel):
    name: str
    email: EmailStr
    message: str
    type: str