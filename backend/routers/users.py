from fastapi import APIRouter, HTTPException, status
from app.db import db
from app.models import User, UserLogin, Token
from app.auth import get_password_hash, verify_password, create_access_token
from bson import ObjectId

router = APIRouter()

@router.post("/register", response_model=User)
async def register_user(user_data: User):
    existing_user = await db["users"].find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado."
        )
    
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.model_dump()
    user_dict["password"] = hashed_password
    result = await db["users"].insert_one(user_dict)
    new_user = await db["users"].find_one({"_id": result.inserted_id})
    new_user["_id"] = str(new_user["_id"])
    del new_user["password"] 
    return new_user


@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: UserLogin):
    user_in_db = await db["users"].find_one({"email": form_data.email})
    if not user_in_db or not verify_password(form_data.password, user_in_db["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user_in_db["email"]} # "sub" (subject) es el email del usuario
    )
    return {"access_token": access_token, "token_type": "bearer"}