from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import obtener_usuario_actual
from app.database.database import get_db
from app.models import Venta
from app.services.reportes import generar_pdf_ventas, generar_xlsx_ventas

router = APIRouter(prefix="/api/reportes", tags=["Reportes"])


def _ventas_filtradas(db: Session, actual, fecha: date | None, fecha_desde: date | None, fecha_hasta: date | None):
    start = fecha_desde or fecha or date.today()
    end = fecha_hasta or fecha or start
    end_exclusive = datetime.combine(end + timedelta(days=1), time.min)
    query = db.query(Venta).options(joinedload(Venta.detalles)).filter(Venta.fecha >= datetime.combine(start, time.min), Venta.fecha < end_exclusive)
    if actual.rol.nombre == "cliente":
        query = query.filter(Venta.cliente_id == actual.id)
    return query.order_by(Venta.fecha.asc()).all()


@router.get("/ventas-diarias/pdf")
def pdf(
    fecha: date | None = Query(default=None),
    fecha_desde: date | None = Query(default=None),
    fecha_hasta: date | None = Query(default=None),
    db: Session = Depends(get_db),
    actual=Depends(obtener_usuario_actual),
):
    stream = generar_pdf_ventas(_ventas_filtradas(db, actual, fecha, fecha_desde, fecha_hasta))
    return StreamingResponse(stream, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=ventas_pixel_store.pdf"})


@router.get("/ventas-diarias/excel")
def excel(
    fecha: date | None = Query(default=None),
    fecha_desde: date | None = Query(default=None),
    fecha_hasta: date | None = Query(default=None),
    db: Session = Depends(get_db),
    actual=Depends(obtener_usuario_actual),
):
    stream = generar_xlsx_ventas(_ventas_filtradas(db, actual, fecha, fecha_desde, fecha_hasta))
    return StreamingResponse(stream, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=ventas_pixel_store.xlsx"})


def _ventas_historial(db: Session, actual, estado: str | None = None, fecha: date | None = None):
    """Devuelve ventas y pedidos (con factura) como filas de reporte, filtrados por estado y fecha."""
    from app.models import Factura, Pedido

    query = db.query(Venta).options(joinedload(Venta.detalles))
    if actual.rol.nombre == "cliente":
        query = query.filter(Venta.cliente_id == actual.id)
    if estado:
        query = query.filter(Venta.estado == estado)
    if fecha:
        dia_inicio = datetime.combine(fecha, time.min)
        dia_fin = datetime.combine(fecha + timedelta(days=1), time.min)
        query = query.filter(Venta.fecha >= dia_inicio, Venta.fecha < dia_fin)
    ventas = query.order_by(Venta.fecha.asc()).all()

    filas = []
    for v in ventas:
        filas.append({
            "venta_id": f"V-{v.id}",
            "cliente_id": v.cliente_id,
            "fecha": v.fecha,
            "subtotal": v.subtotal,
            "impuestos": v.impuestos,
            "total": v.total,
            "estado": v.estado,
        })

    # Pedidos con factura (todas las facturas por pedido)
    pedidos_q = (
        db.query(Pedido)
        .join(Factura, Factura.pedido_id == Pedido.id)
        .options(joinedload(Pedido.usuario))
    )
    if actual.rol.nombre == "cliente":
        pedidos_q = pedidos_q.filter(Pedido.usuario_id == actual.id)
    if estado:
        pedidos_q = pedidos_q.filter(Pedido.estado == estado)
    if fecha:
        dia_inicio = datetime.combine(fecha, time.min)
        dia_fin = datetime.combine(fecha + timedelta(days=1), time.min)
        pedidos_q = pedidos_q.filter(Pedido.fecha >= dia_inicio, Pedido.fecha < dia_fin)
    pedidos = pedidos_q.order_by(Pedido.fecha.asc()).all()

    for ped in pedidos:
        filas.append({
            "venta_id": f"P-{ped.id}",
            "cliente_id": ped.usuario_id,
            "fecha": ped.fecha,
            "subtotal": ped.total,
            "impuestos": 0,
            "total": ped.total,
            "estado": ped.estado,
        })

    filas.sort(key=lambda r: r["fecha"] or datetime.min)
    return filas


@router.get("/ventas-historial/pdf")
def historial_pdf(
    estado: str | None = Query(default=None),
    fecha: date | None = Query(default=None),
    db: Session = Depends(get_db),
    actual=Depends(obtener_usuario_actual),
):
    stream = generar_pdf_ventas(_ventas_historial(db, actual, estado, fecha))
    return StreamingResponse(stream, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=historial_ventas_pixel_store.pdf"})


@router.get("/ventas-historial/excel")
def historial_excel(
    estado: str | None = Query(default=None),
    fecha: date | None = Query(default=None),
    db: Session = Depends(get_db),
    actual=Depends(obtener_usuario_actual),
):
    stream = generar_xlsx_ventas(_ventas_historial(db, actual, estado, fecha))
    return StreamingResponse(stream, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=historial_ventas_pixel_store.xlsx"})
