"""Endpoints de estadísticas para los dashboards, protegidos por rol."""
from datetime import datetime
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.detalle_pedido import DetallePedido
from app.models.pedido import Pedido
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.core.dependencies import obtener_usuario_actual
from app.core.dependencies import verificar_roles

router = APIRouter(
    prefix="/api/estadisticas",
    tags=["Estadísticas"]
)

# Constantes de negocio (documentadas; ajustables)
META_MENSUAL = 10000000
COMISION_RATE = 0.05
STOCK_BAJO = 5

ESTADOS_PEDIDO = ["pendiente", "procesando", "enviado", "entregado", "cancelado"]


def _inicio_semana(fecha: datetime) -> datetime:
    """Lunes de la semana actual."""
    inicio = fecha - timedelta(days=fecha.weekday())
    return inicio.replace(hour=0, minute=0, second=0, microsecond=0)


def _total_en_periodo(db: Session, desde: datetime, hasta: datetime) -> float:
    """Suma del total de pedidos no cancelados en el rango."""
    total = (
        db.query(func.coalesce(func.sum(Pedido.total), 0.0))
        .filter(Pedido.fecha >= desde, Pedido.fecha < hasta)
        .filter(Pedido.estado != "cancelado")
        .scalar()
    )
    return float(total or 0.0)


def _pedidos_por_estado(db: Session, usuario_id: int | None = None) -> dict:
    consulta = db.query(Pedido.estado, func.count(Pedido.id))
    if usuario_id is not None:
        consulta = consulta.filter(Pedido.usuario_id == usuario_id)
    filas = consulta.group_by(Pedido.estado).all()
    conteo = {estado: 0 for estado in ESTADOS_PEDIDO}
    for estado, cantidad in filas:
        conteo[estado] = cantidad
    return conteo


# ==========================================================
# ADMIN
# ==========================================================

@router.get("/admin")
def estadisticas_admin(
    db: Session = Depends(get_db),
    usuario_actual=Depends(verificar_roles("administrador"))
):
    ahora = datetime.utcnow()
    inicio_dia = ahora.replace(hour=0, minute=0, second=0, microsecond=0)
    inicio_semana = _inicio_semana(ahora)
    inicio_mes = ahora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    fin = ahora + timedelta(days=1)

    # Productos agotados
    agotados = (
        db.query(Producto)
        .filter(Producto.estado == True, Producto.stock == 0)
        .order_by(Producto.nombre)
        .all()
    )

    # Productos más vendidos (por cantidad total en detalles)
    mas_vendidos = (
        db.query(
            Producto.nombre,
            func.coalesce(func.sum(DetallePedido.cantidad), 0).label("vendidos")
        )
        .join(DetallePedido, DetallePedido.producto_id == Producto.id)
        .filter(Producto.estado == True)
        .group_by(Producto.id, Producto.nombre)
        .order_by(func.sum(DetallePedido.cantidad).desc())
        .limit(5)
        .all()
    )

    total_usuarios = db.query(func.count(Usuario.id)).scalar()

    return {
        "productos_agotados": [
            {"id": p.id, "nombre": p.nombre, "stock": p.stock} for p in agotados
        ],
        "productos_mas_vendidos": [
            {"nombre": nombre, "vendidos": int(vendidos)} for nombre, vendidos in mas_vendidos
        ],
        "total_usuarios": int(total_usuarios or 0),
        "ventas_dia": _total_en_periodo(db, inicio_dia, fin),
        "ventas_semana": _total_en_periodo(db, inicio_semana, fin),
        "ventas_mes": _total_en_periodo(db, inicio_mes, fin),
        "pedidos_por_estado": _pedidos_por_estado(db),
        "rol": usuario_actual.rol.nombre,
        "estado": usuario_actual.estado,
    }


# ============================================================
# EMPLEADO
# ============================================================

@router.get("/empleado")
def estadisticas_empleado(
    db: Session = Depends(get_db),
    usuario_actual=Depends(verificar_roles("empleado"))
):
    ahora = datetime.utcnow()
    inicio_dia = ahora.replace(hour=0, minute=0, second=0, microsecond=0)
    inicio_semana = _inicio_semana(ahora)
    inicio_mes = ahora.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    fin = ahora + timedelta(days=1)

    ventas_dia = _total_en_periodo(db, inicio_dia, fin)
    ventas_mes = _total_en_periodo(db, inicio_mes, fin)

    # Ventas por día de la semana actual (lun..dom en curso)
    ventas_semana = []
    for i in range(7):
        d_ini = inicio_semana + timedelta(days=i)
        d_fin = d_ini + timedelta(days=1)
        ventas_semana.append(_total_en_periodo(db, d_ini, d_fin))

    entregados = (
        db.query(func.count(Pedido.id))
        .filter(Pedido.estado == "entregado")
        .scalar()
    )

    stock_bajo = (
        db.query(Producto)
        .filter(Producto.estado == True, Producto.stock <= STOCK_BAJO)
        .order_by(Producto.stock)
        .all()
    )

    return {
        "ventas_dia": ventas_dia,
        "ventas_semana": ventas_semana,
        "metas_mensuales": {
            "meta": META_MENSUAL,
            "logrado": ventas_mes,
            "porcentaje": round(ventas_mes / META_MENSUAL * 100, 1) if META_MENSUAL else 0,
        },
        "comisiones": round(ventas_mes * COMISION_RATE, 2),
        "productos_entregados": int(entregados or 0),
        "productos_stock_bajo": [
            {"id": p.id, "nombre": p.nombre, "stock": p.stock} for p in stock_bajo
        ],
        "rol": usuario_actual.rol.nombre,
        "estado": usuario_actual.estado,
    }


# ============================================================
# CLIENTE
# ============================================================

@router.get("/cliente")
def estadisticas_cliente(
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    total_pedidos = (
        db.query(func.count(Pedido.id))
        .filter(Pedido.usuario_id == usuario_actual.id)
        .scalar()
    )
    return {
        "total_pedidos": int(total_pedidos or 0),
        "pedidos_por_estado": _pedidos_por_estado(db, usuario_actual.id),
        "rol": usuario_actual.rol.nombre,
        "estado": usuario_actual.estado,
    }

@router.get("/comercial")
def estadisticas_comerciales(
    fecha_desde: datetime | None = None,
    fecha_hasta: datetime | None = None,
    estado: str | None = None,
    cliente_id: int | None = None,
    producto_id: int | None = None,
    servicio_id: int | None = None,
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual),
):
    from app.models import DetalleVenta, Factura, PQR, Venta

    query = db.query(Venta).join(DetalleVenta, DetalleVenta.venta_id == Venta.id, isouter=True)
    if usuario_actual.rol.nombre == "cliente":
        query = query.filter(Venta.cliente_id == usuario_actual.id)
    elif cliente_id:
        query = query.filter(Venta.cliente_id == cliente_id)
    if fecha_desde:
        query = query.filter(Venta.fecha >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Venta.fecha <= fecha_hasta)
    if estado:
        query = query.filter(Venta.estado == estado)
    if producto_id:
        query = query.filter(DetalleVenta.producto_id == producto_id)
    if servicio_id:
        query = query.filter(DetalleVenta.servicio_id == servicio_id)

    ventas = query.distinct().order_by(Venta.fecha.asc()).all()
    venta_ids = [venta.id for venta in ventas]
    factura_query = db.query(Factura).join(Venta)
    if venta_ids:
        factura_query = factura_query.filter(Venta.id.in_(venta_ids))
    else:
        factura_query = factura_query.filter(False)
    pqr_query = db.query(PQR)
    if usuario_actual.rol.nombre == "cliente":
        pqr_query = pqr_query.filter(PQR.usuario_id == usuario_actual.id)

    return {
        "ventas_total": len(ventas),
        "ventas_valor": sum(float(venta.total or 0) for venta in ventas),
        "facturas_total": factura_query.count(),
        "pqr_total": pqr_query.count(),
        "pqr_pendientes": pqr_query.filter(PQR.estado == "pendiente").count(),
        "serie": [
            {"fecha": venta.fecha.strftime("%Y-%m-%d"), "total": float(venta.total or 0)}
            for venta in ventas
        ],
    }
