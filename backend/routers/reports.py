from fastapi import APIRouter, Depends
from app.db import db
from app.auth import get_current_user
from app.models import User
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
async def get_stats(range: str = "all", current_user: User = Depends(get_current_user)):
    # Filtro de fecha
    filter_query = {}
    
    if range == "week":
        # Últimos 7 días
        start_date = datetime.now() - timedelta(days=7)
        filter_query["created_at"] = {"$gte": start_date}
    elif range == "month":
        # Últimos 30 días
        start_date = datetime.now() - timedelta(days=30)
        filter_query["created_at"] = {"$gte": start_date}
    
    # Filtro para ventas (solo pagados/entregados y dentro de la fecha)
    match_ventas = {"status": {"$in": ["pagado", "recibido", "preparacion", "reparto", "entregado"]}}
    match_ventas.update(filter_query) # Añadir filtro de fecha

    # 1. Total Ventas
    pipeline_ventas = [
        {"$match": match_ventas},
        {"$group": {"_id": None, "total_sales": {"$sum": "$total"}}}
    ]
    ventas_result = await db["orders"].aggregate(pipeline_ventas).to_list(1)
    total_ventas = ventas_result[0]["total_sales"] if ventas_result else 0

    # 2. Cantidad de Pedidos (Todos los estados, filtro de fecha)
    total_pedidos = await db["orders"].count_documents(filter_query)

    # 3. Pedidos por Estado (Filtro de fecha)
    pipeline_estados = [
        {"$match": filter_query},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    estados_result = await db["orders"].aggregate(pipeline_estados).to_list(None)
    estados_dict = {item["_id"]: item["count"] for item in estados_result}

    # 4. Últimos movimientos (Filtro de fecha)
    ultimos_pedidos = []
    # Buscamos con el filtro de fecha
    cursor = db["orders"].find(filter_query).sort("created_at", -1).limit(10)
    async for order in cursor:
        ultimos_pedidos.append({
            "id": str(order["_id"]),
            "total": order["total"],
            "status": order["status"],
            "date": order.get("created_at") # Usamos .get por seguridad
        })

    return {
        "total_sales": total_ventas,
        "total_orders": total_pedidos,
        "orders_by_status": estados_dict,
        "recent_orders": ultimos_pedidos
    }