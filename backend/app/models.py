from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# producto
class Product(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    category: Optional[str] = None

# Usuario
class User(BaseModel):
    email: str
    full_name: str
    password: Optional[str] = None
    role: str = "cliente"

# Orden
class Order(BaseModel):
    user_id: str
    items: List[str]  
    total: float
    status: str = "recibido" 
    payment_method: Optional[str] = None
    address: Optional[str] = None        
    delivery_person: Optional[str] = None 
    created_at: datetime = datetime.now()

# actualziar orden
class OrderUpdate(BaseModel):
    status: Optional[str] = None
    delivery_person: Optional[str] = None

# Login y Token
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

#   Resetear contraseña
class EmailRequest(BaseModel):
    email: EmailStr

# Resetear contraseña 2da parte
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Actualizar usuario
class UserUpdate(BaseModel):
    full_name: str

# Mensaje de contacto
class Message(BaseModel):
    name: str
    email: EmailStr
    message: str
    type: str