from fastapi import APIRouter, HTTPException, Depends, Body
from app.db import db
from app.models import Order, OrderUpdate, User
from app.auth import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()

#  Funcion admin , listar todas las órdenes
@router.get("/")
async def list_orders():
    orders_list = []
    cursor = db["orders"].find().sort("created_at", -1)
    async for order in cursor:
        order["_id"] = str(order["_id"])
        orders_list.append(order)
    return orders_list

#  funcion cliente , listar mis órdenes
@router.get("/me")
async def read_my_orders(current_user: User = Depends(get_current_user)):
    my_orders = []
    cursor = db["orders"].find({"user_id": current_user.email}).sort("created_at", -1)
    async for order in cursor:
        order["_id"] = str(order["_id"])
        my_orders.append(order)
    return my_orders

#  Obtener UNA orden por ID 
@router.get("/{order_id}")
async def get_order(order_id: str):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    order = await db["orders"].find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
        
    order["_id"] = str(order["_id"])
    return order

# Crear Orden
@router.post("/")
async def create_order(order: Order):
    order_dict = order.model_dump()
    if not order_dict.get("created_at"):
        order_dict["created_at"] = datetime.now()
    
    result = await db["orders"].insert_one(order_dict)
    new_order = await db["orders"].find_one({"_id": result.inserted_id})
    new_order["_id"] = str(new_order["_id"])
    return new_order

# Funcion admin , actualizar Orden
@router.patch("/{order_id}")
async def update_order(order_id: str, update_data: OrderUpdate):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    data = {k: v for k, v in update_data.model_dump().items() if v is not None}

    if len(data) >= 1:
        await db["orders"].update_one(
            {"_id": ObjectId(order_id)}, 
            {"$set": data}
        )

    updated_order = await db["orders"].find_one({"_id": ObjectId(order_id)})
    if not updated_order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
        
    updated_order["_id"] = str(updated_order["_id"])
    return updated_order