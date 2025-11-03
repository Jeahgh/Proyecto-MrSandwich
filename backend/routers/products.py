from fastapi import APIRouter, HTTPException
from app.models import Product  
from app.db import db           
from bson import ObjectId       

router = APIRouter()

@router.post("/")  
async def create_product(product: Product):
    product_data = product.model_dump()     
    result = await db["products"].insert_one(product_data)    
    new_product = await db["products"].find_one({"_id": result.inserted_id})
    new_product["_id"] = str(new_product["_id"]) 
    return new_product


@router.get("/") 
async def list_products():
    products_list = []
    cursor = db["products"].find()
    async for product in cursor:
        product["_id"] = str(product["_id"])
        products_list.append(product)
        
    return products_list


@router.get("/{product_id}")
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="ID de producto no válido")
    product = await db["products"].find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product["_id"] = str(product["_id"])
    return product