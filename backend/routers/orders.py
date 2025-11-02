from fastapi import APIRouter, HTTPException
from fastapi import APIRouter, Depends
from app import models, db
from bson import ObjectId
from app.models import Order


router = APIRouter()

@router.get("/")
async def list_orders():
    orders = await db["orders"].find().to_list(100)
    return orders

@router.post("/")
async def create_order(order: Order):
    result = await db["orders"].insert_one(order.dict(by_alias=True))
    new_order = await db["orders"].find_one({"_id": result.inserted_id})
    return new_order
