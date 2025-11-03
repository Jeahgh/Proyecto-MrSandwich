from fastapi import APIRouter, HTTPException
from app.db import db
from app.models import User
from bson import ObjectId

router = APIRouter()

@router.get("/")
async def list_users():
    users_list = []
    cursor = db["users"].find()
    async for user in cursor:
        user["_id"] = str(user["_id"])
        users_list.append(user)
    return users_list

@router.post("/")
async def create_user(user: User):
    existing = await db["users"].find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    result = await db["users"].insert_one(user.model_dump())
    new_user = await db["users"].find_one({"_id": result.inserted_id})
    
    new_user["_id"] = str(new_user["_id"])
    return new_user