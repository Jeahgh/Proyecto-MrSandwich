from fastapi import APIRouter, HTTPException
from app.db import db
from app.models import Order
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def list_orders():
    orders_list = []
    cursor = db["orders"].find()
    async for order in cursor:
        order["_id"] = str(order["_id"])
        orders_list.append(order)
    return orders_list

@router.post("/")
async def create_order(order: Order):
    result = await db["orders"].insert_one(order.model_dump())
    new_order = await db["orders"].find_one({"_id": result.inserted_id})
    
    new_order["_id"] = str(new_order["_id"])
    return new_order