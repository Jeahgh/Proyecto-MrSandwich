from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from app.db import db
from app.models import (
    User, 
    UserLogin, 
    Token, 
    EmailRequest, 
    ResetPasswordRequest,
    UserUpdate 
)
from app.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    get_current_user, 
    SECRET_KEY, 
    ALGORITHM
)
from jose import jwt, JWTError
from bson import ObjectId

router = APIRouter()

#  Endpoint 1: Registrar un Usuario 
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


#  Endpoint 2: Iniciar Sesión 
@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: UserLogin):
    user_in_db = await db["users"].find_one({"email": form_data.email})
    if not user_in_db or not verify_password(form_data.password, user_in_db["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_role = user_in_db.get("role", "cliente") 
    
    access_token = create_access_token(
        data={"sub": user_in_db["email"]} 
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user_role
    }


#  Endpoint 3: Pedir Reseteo de Contraseña 
@router.post("/request-password-reset", response_model=Token)
async def request_password_reset(request: EmailRequest):
    user_in_db = await db["users"].find_one({"email": request.email})
    if not user_in_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existe un usuario con ese email.",
        )
    
    access_token = create_access_token(
        data={"sub": user_in_db["email"], "scope": "reset_password"},
        expires_delta=timedelta(minutes=5) 
    )
    return {"access_token": access_token, "token_type": "bearer", "role": "cliente"}


#  Endpoint 4: Confirmar Reseteo de Contraseña 
@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        scope: str = payload.get("scope")
        
        if email is None or scope != "reset_password":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o corrupto",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token ha expirado o es inválido",
        )
    
    hashed_password = get_password_hash(request.new_password)
    await db["users"].update_one(
        {"email": email},
        {"$set": {"password": hashed_password}}
    )
            
    return {"message": "Contraseña actualizada con éxito"}


#  Endpoint 5: OBTENER mi perfil 
@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


#  Endpoint 6: ACTUALIZAR mi perfil 
@router.put("/me", response_model=User)
async def update_users_me(user_data: UserUpdate, current_user: User = Depends(get_current_user)):
    new_full_name = user_data.full_name

    await db["users"].update_one(
        {"email": current_user.email},
        {"$set": {"full_name": new_full_name}}
    )

    current_user.full_name = new_full_name
    return current_user