from fastapi import APIRouter, HTTPException
from fastapi import APIRouter, Depends
from app import models, db
from app.models import User


from bson import ObjectId

router = APIRouter()

@router.get("/")
async def list_users():
    users = await db["users"].find().to_list(100)
    return users

@router.post("/")
async def create_user(user: User):
    existing = await db["users"].find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    result = await db["users"].insert_one(user.dict(by_alias=True))
    new_user = await db["users"].find_one({"_id": result.inserted_id})
    return new_user
