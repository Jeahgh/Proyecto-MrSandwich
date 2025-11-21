from fastapi import APIRouter, HTTPException, status
from app.models import Product  
from app.db import db           
from bson import ObjectId       

router = APIRouter()

# CREAR Producto
@router.post("/", response_model=Product)  
async def create_product(product: Product):
    product_data = product.model_dump()     
    result = await db["products"].insert_one(product_data)    
    new_product = await db["products"].find_one({"_id": result.inserted_id})
    
    if new_product:
        new_product["_id"] = str(new_product["_id"]) 
    
    return new_product


# LISTAR Productos 
@router.get("/") 
async def list_products():
    products_list = []
    cursor = db["products"].find()
    async for product in cursor:
        product["_id"] = str(product["_id"])
        products_list.append(product)         
    return products_list


# OBTENER un Producto
@router.get("/{product_id}")
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="ID de producto no válido")
    product = await db["products"].find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    product["_id"] = str(product["_id"])
    return Product(**product)


# ACTUALIZAR un Producto
@router.put("/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: Product):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="ID de producto no válido")

    product_dict = product_data.model_dump()

    result = await db["products"].update_one(
        {"_id": ObjectId(product_id)},
        {"$set": product_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    updated_product = await db["products"].find_one({"_id": ObjectId(product_id)})
    
    if updated_product:
        updated_product["_id"] = str(updated_product["_id"])
        return updated_product
    else:
        raise HTTPException(status_code=404, detail="Producto actualizado pero no encontrado")


# Eliminar Producto
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID de producto no válido")

    result = await db["products"].delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    
    return