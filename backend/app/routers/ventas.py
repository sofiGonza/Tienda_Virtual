from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.core.dependencies import obtener_usuario_actual, verificar_roles
from app.database.database import get_db
from app.models import DetalleFactura, DetalleVenta, Factura, Producto, Servicio, Usuario, Venta
from app.schemas.venta import VentaCreate, VentaResponse
router = APIRouter(prefix="/api/ventas", tags=["Ventas"])
def serializar(v):
    return v

def _crear_factura_venta(venta, db):
    """Genera la factura de la venta si aún no existe."""
    if venta.factura:
        return venta.factura
    factura = Factura(
        venta_id=venta.id,
        numero=f"PS-{datetime.utcnow():%Y%m%d}-{venta.id:06d}",
        subtotal=venta.subtotal,
        impuestos=venta.impuestos,
        total=venta.total,
        estado="emitida",
    )
    factura.detalles = [
        DetalleFactura(
            producto_id=d.producto_id,
            servicio_id=d.servicio_id,
            descripcion=d.nombre_item,
            cantidad=d.cantidad,
            precio_unitario=d.precio_unitario,
            subtotal=d.subtotal,
        )
        for d in venta.detalles
    ]
    db.add(factura)
    db.commit()
    db.refresh(factura)
    return factura

@router.post("", response_model=VentaResponse, status_code=status.HTTP_201_CREATED)
def crear_venta(datos: VentaCreate, db: Session = Depends(get_db), actual=Depends(obtener_usuario_actual)):
    rol = actual.rol.nombre
    cliente_id = datos.cliente_id or actual.id
    if datos.cliente_id and rol not in {"administrador", "empleado"}: raise HTTPException(403, "No puedes registrar ventas para otro cliente")
    if not db.query(Usuario).filter(Usuario.id == cliente_id, Usuario.estado == True).first(): raise HTTPException(404, "Cliente no encontrado")
    venta = Venta(cliente_id=cliente_id, operador_id=actual.id, estado="registrada")
    subtotal = Decimal("0"); detalles = []
    try:
        for item in datos.items:
            if item.producto_id:
                obj = db.query(Producto).filter(Producto.id == item.producto_id, Producto.estado == True).with_for_update().first()
                if not obj: raise HTTPException(404, "Producto no encontrado")
                if obj.stock < item.cantidad: raise HTTPException(400, f"Stock insuficiente para {obj.nombre}")
                precio = Decimal(str(obj.precio)); obj.stock -= item.cantidad; nombre = obj.nombre
            else:
                obj = db.query(Servicio).filter(Servicio.id == item.servicio_id, Servicio.estado == True).first()
                if not obj: raise HTTPException(404, "Servicio no encontrado")
                precio = Decimal(str(obj.precio)); nombre = obj.nombre
            bruto = precio * item.cantidad
            descuento_linea = min(item.descuento, bruto)
            linea = bruto - descuento_linea; subtotal += linea
            detalles.append(DetalleVenta(producto_id=item.producto_id, servicio_id=item.servicio_id, nombre_item=nombre, cantidad=item.cantidad, precio_unitario=precio, descuento=descuento_linea, subtotal=linea))
        descuento = min(datos.descuento, subtotal)
        base = subtotal - descuento
        impuestos = (base * datos.impuesto_porcentaje / Decimal("100")).quantize(Decimal("0.01"))
        venta.subtotal = subtotal; venta.descuento = descuento; venta.impuestos = impuestos; venta.total = base + impuestos; venta.detalles = detalles
        db.add(venta); db.commit(); db.refresh(venta)
        factura = _crear_factura_venta(venta, db)
        setattr(venta, "factura_id", factura.id)
        db.refresh(venta)
        return venta
    except HTTPException: db.rollback(); raise
    except Exception: db.rollback(); raise HTTPException(500, "No se pudo registrar la venta")
@router.put("/{venta_id}/anular", response_model=VentaResponse)
def anular_venta(
    venta_id: int,
    db: Session = Depends(get_db),
    actual=Depends(verificar_roles("administrador", "empleado"))
):
    venta = (
        db.query(Venta)
        .options(joinedload(Venta.detalles), joinedload(Venta.factura))
        .filter(Venta.id == venta_id)
        .first()
    )
    if not venta:
        raise HTTPException(404, "Venta no encontrada")
    if venta.estado == "anulada":
        raise HTTPException(400, "La venta ya está anulada")

    for detalle in venta.detalles:
        if detalle.producto_id:
            producto = db.query(Producto).filter(Producto.id == detalle.producto_id).first()
            if producto is not None:
                producto.stock += detalle.cantidad

    venta.estado = "anulada"
    if venta.factura:
        venta.factura.estado = "anulada"

    db.commit()
    db.refresh(venta)
    return venta


@router.get("", response_model=list[VentaResponse])
def listar_ventas(cliente_id: int | None = Query(None), estado: str | None = Query(None), fecha_desde: str | None = Query(None), fecha_hasta: str | None = Query(None), db: Session = Depends(get_db), actual=Depends(obtener_usuario_actual)):
    q = db.query(Venta).options(joinedload(Venta.detalles), joinedload(Venta.cliente)).order_by(Venta.fecha.desc())
    if actual.rol.nombre == "cliente": q = q.filter(Venta.cliente_id == actual.id)
    elif cliente_id: q = q.filter(Venta.cliente_id == cliente_id)
    if estado: q = q.filter(Venta.estado == estado)
    if fecha_desde: q = q.filter(Venta.fecha >= fecha_desde)
    if fecha_hasta: q = q.filter(Venta.fecha <= fecha_hasta)
    ventas = q.all()
    for v in ventas:
        if v.cliente:
            v.cliente_nombre = f"{v.cliente.nombre} {v.cliente.apellido}".strip() or v.cliente.correo
    return ventas
@router.get("/{venta_id}", response_model=VentaResponse)
def obtener_venta(venta_id: int, db: Session = Depends(get_db), actual=Depends(obtener_usuario_actual)):
    venta = db.query(Venta).options(joinedload(Venta.detalles), joinedload(Venta.cliente)).filter(Venta.id == venta_id).first()
    if not venta: raise HTTPException(404, "Venta no encontrada")
    if actual.rol.nombre == "cliente" and venta.cliente_id != actual.id: raise HTTPException(403, "No tienes permiso para consultar esta venta")
    if venta.cliente:
        venta.cliente_nombre = f"{venta.cliente.nombre} {venta.cliente.apellido}".strip() or venta.cliente.correo
    return venta
