from fastapi import APIRouter, HTTPException, status
from app.models import Product  
from app.db import db           
from bson import ObjectId       

router = APIRouter()

# 1. CREAR Producto (Sin cambios)
@router.post("/", response_model=Product)  
async def create_product(product: Product):
    product_data = product.model_dump()     
    result = await db["products"].insert_one(product_data)    
    new_product = await db["products"].find_one({"_id": result.inserted_id})
    
    if new_product:
        new_product["_id"] = str(new_product["_id"]) 
    
    return new_product


# 2. LISTAR Productos (AQUÍ ESTÁ EL ARREGLO)
@router.get("/") 
async def list_products():
    products_list = []
    cursor = db["products"].find()
    async for product in cursor:
        product["_id"] = str(product["_id"])
        
        # === INICIO DEL CAMBIO ===
        # Antes: products_list.append(Product(**product))
        # Ahora (enviamos el diccionario crudo, sin que Pydantic le quite el _id):
        products_list.append(product) 
        # === FIN DEL CAMBIO ===
        
    return products_list


# 3. OBTENER un Producto (por ID) (Sin cambios)
@router.get("/{product_id}")
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="ID de producto no válido")
    product = await db["products"].find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    product["_id"] = str(product["_id"])
    return Product(**product) # <-- Aquí está bien, solo devuelve uno


# 4. ELIMINAR un Producto (Sin cambios)
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID de producto no válido")

    result = await db["products"].delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    
    return