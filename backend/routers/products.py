from fastapi import APIRouter, HTTPException
from fastapi import APIRouter, Depends
from app import models, db
from bson import ObjectId
from app.models import Product

router = APIRouter()

@router.get("/")
async def list_products():
    products = await db["products"].find().to_list(100)
    return products

@router.post("/")
async def create_product(product: Product):
    result = await db["products"].insert_one(product.dict(by_alias=True))
    new_product = await db["products"].find_one({"_id": result.inserted_id})
    return new_product

@router.get("/{product_id}")
async def get_product(product_id: str):
    product = await db["products"].find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product
