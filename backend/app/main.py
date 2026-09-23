from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.database import Base
from app.database.database import engine
from app.database.init_db import crear_tablas
from app.database.init_db import sembrar_datos

from app.models import (
    Rol,
    Permiso,
    Usuario,
    Producto,
    Pedido,
    DetallePedido,
    Venta, DetalleVenta, Factura, DetalleFactura, PQR, Conversacion, Mensaje
)

from app.routers import auth
from app.routers import usuarios
from app.routers import productos
from app.routers import pedidos
from app.routers import servicios
from app.routers import estadisticas, ventas, facturas, reportes, pqr, chatbot


# ==========================================================
# CREAR TABLAS
# ==========================================================

Base.metadata.create_all(
    bind=engine
)

# ==========================================================
# SEMBRAR DATOS INICIALES (idempotente)
# ==========================================================

crear_tablas()
sembrar_datos()


# ==========================================================
# MIDDLEWARE HTTPS DETRÁS DE PROXY (X-Forwarded-Proto)
# ==========================================================

class ForwardedProtoMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):

        proto = request.headers.get("x-forwarded-proto", "")

        if proto == "https":
            request.scope["scheme"] = "https"

        return await call_next(request)


# ==========================================================
# FASTAPI
# ==========================================================

app = FastAPI(
    title="Pixel Store API",
    description="Backend de Pixel Store desarrollado con FastAPI",
    version="1.0.0"
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    ForwardedProtoMiddleware
)

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "https://frontend-production-8956.up.railway.app"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==========================================================
# ROUTERS
# ==========================================================

app.include_router(
    auth.router
)

app.include_router(
    usuarios.router
)

app.include_router(
    productos.router
)

app.include_router(
    pedidos.router
)

app.include_router(
    servicios.router
)

app.include_router(estadisticas.router)
app.include_router(ventas.router)
app.include_router(facturas.router)
app.include_router(reportes.router)
app.include_router(pqr.router)
app.include_router(chatbot.router)


# ==========================================================
# RUTA PRINCIPAL
# ==========================================================

@app.get("/")
def inicio():

    return {
        "mensaje": "Pixel Store API funcionando",
        "version": "1.0.0"
    }


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }