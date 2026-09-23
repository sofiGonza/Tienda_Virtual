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
# CREAR TABLAS + SEMBRAR DATOS (arranque resiliente)
# ==========================================================
# En el despliegue (Railway/Render) la base de datos puede tardar en
# estar lista al primer arranque. Si falla, NO se derriba el proceso:
# se registra el error y se reintenta en segundo plano, para evitar
# que uvicorn entre en crash-loop (que la edge responde con 429).

import logging
import threading
import time

_log = logging.getLogger("pixelstore.init")


def _inicializar_bd(intentos: int = 3, espera: float = 5.0):
    for intento in range(1, intentos + 1):
        try:
            Base.metadata.create_all(bind=engine)
            crear_tablas()
            sembrar_datos()
            _log.info("Base de datos inicializada y datos sembrados.")
            return
        except Exception as exc:  # pragma: no cover - depende del entorno
            _log.warning(
                "Intento %d/%d de inicializar la BD falló: %s",
                intento, intentos, exc,
            )
            if intento < intentos:
                time.sleep(espera)


try:
    _inicializar_bd()
except Exception:
    threading.Thread(target=_inicializar_bd, daemon=True).start()


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
        "https://frontend-production-8956.up.railway.app",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],

    # Cubre cualquier subdominio *.up.railway.app (útil si Railway
    # regenera el dominio público del frontend al redesplegar).
    allow_origin_regex=r"https://.*\.up\.railway\.app",

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