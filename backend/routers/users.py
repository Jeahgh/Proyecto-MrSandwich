from fastapi import APIRouter, HTTPException, status
from app.db import db
from app.models import User, UserLogin, Token
from app.auth import get_password_hash, verify_password, create_access_token
from bson import ObjectId
from app.models import User, UserLogin, Token, EmailRequest, ResetPasswordRequest
from app.auth import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError
from datetime import timedelta

router = APIRouter()

# 1. REGISTRAR un Usuario
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


# 2. LOGIN de Usuario
@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: UserLogin):
    user_in_db = await db["users"].find_one({"email": form_data.email})
    if not user_in_db or not verify_password(form_data.password, user_in_db["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Asegúrate de que el usuario tenga un rol
    user_role = user_in_db.get("role", "cliente") 
    
    access_token = create_access_token(
        data={"sub": user_in_db["email"]} 
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user_role  
    }


@router.post("/request-password-reset", response_model=Token)
async def request_password_reset(request: EmailRequest):
    """
    Paso 1: El usuario pone su email.
    Verificamos si el email existe.
    Si existe, creamos un token especial de 5 minutos y se lo devolvemos.
    """
    user_in_db = await db["users"].find_one({"email": request.email})

    if not user_in_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existe un usuario con ese email.",
        )

    # Creamos un token de corta duración (5 minutos)
    access_token = create_access_token(
        data={"sub": user_in_db["email"], "scope": "reset_password"},
        expires_delta=timedelta(minutes=5) 
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """
    Paso 2: El usuario envía el token (que guardamos) y la nueva contraseña.
    Validamos el token y actualizamos la contraseña.
    """
    try:
        # Decodificamos el token
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

    # Si el token es válido, hasheamos la nueva contraseña
    hashed_password = get_password_hash(request.new_password)

    # Actualizamos al usuario en la BD
    result = await db["users"].update_one(
        {"email": email},
        {"$set": {"password": hashed_password}}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se pudo actualizar la contraseña del usuario.",
        )

    return {"message": "Contraseña actualizada con éxito"}

