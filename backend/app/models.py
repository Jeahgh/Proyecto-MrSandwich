from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId

class PyObjectId(ObjectId):
    """Permite usar ObjectId en modelos Pydantic."""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class Product(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    category: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: str
    full_name: Optional[str] = None
    password: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Order(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    items: List[str]
    total: float
    status: str = "pending"

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
