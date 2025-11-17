from fastapi import APIRouter, HTTPException
from app.db import db
from app.models import Message

router = APIRouter()

@router.post("/")
async def create_message(message: Message):
 
    message_data = message.model_dump()    
    result = await db["messages"].insert_one(message_data)
    
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Error al guardar el mensaje")
        

    return {"message": "¡Mensaje recibido! Gracias por contactarnos."}