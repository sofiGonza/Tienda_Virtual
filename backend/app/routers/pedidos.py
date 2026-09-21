
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from datetime import datetime

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido
from app.models.producto import Producto
from app.models.servicio import Servicio
from app.models.usuario import Usuario

from app.schemas.pedido import PedidoCreate
from app.schemas.pedido import PedidoMixtoCreate
from app.schemas.pedido import PedidoEstadoUpdate
from app.schemas.pedido import PedidoResponse

from app.core.dependencies import obtener_usuario_actual
from app.core.dependencies import verificar_roles


router = APIRouter(
    prefix="/api/pedidos",
    tags=["Pedidos"]
)


def _enriquecer_detalle(db: Session, detalle):
    """Devuelve el detalle como dict con nombre/precio (producto o servicio)."""
    if detalle.servicio_id:
        servicio = (
            db.query(Servicio)
            .filter(Servicio.id == detalle.servicio_id)
            .first()
        )
        return {
            "id": detalle.id,
            "producto_id": detalle.producto_id,
            "servicio_id": detalle.servicio_id,
            "cantidad": detalle.cantidad,
            "horas": detalle.horas,
            "precio_unitario": detalle.precio_unitario,
            "subtotal": detalle.subtotal,
            "nombre": servicio.nombre if servicio else None,
            "precio": servicio.precio if servicio else None,
        }
    producto = (
        db.query(Producto)
        .filter(Producto.id == detalle.producto_id)
        .first()
    )
    return {
        "id": detalle.id,
        "producto_id": detalle.producto_id,
        "servicio_id": None,
        "cantidad": detalle.cantidad,
        "horas": None,
        "precio_unitario": detalle.precio_unitario,
        "subtotal": detalle.subtotal,
        "nombre": producto.nombre if producto else None,
        "precio": producto.precio if producto else None,
    }


def _serializar_pedido(db: Session, pedido):
    """Convierte un pedido ORM a dict con detalles enriquecidos."""
    return {
        "id": pedido.id,
        "usuario_id": pedido.usuario_id,
        "total": pedido.total,
        "estado": pedido.estado,
        "fecha": pedido.fecha,
        "detalles": [_enriquecer_detalle(db, d) for d in pedido.detalles],
        "productos": [],
        "usuario": {
            "id": pedido.usuario.id,
            "nombre": pedido.usuario.nombre,
            "apellido": pedido.usuario.apellido,
            "correo": pedido.usuario.correo,
            "numero_documento": pedido.usuario.numero_documento,
        } if pedido.usuario else None,
        "createdAt": None,
    }


@router.post(
    "",
    response_model=PedidoResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_pedido(
    datos: PedidoMixtoCreate,
    usuario_id: int | None = None,
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    # El administrador puede crear pedidos a nombre de un cliente específico
    if usuario_id is not None:
        if usuario_actual.rol.nombre != "administrador":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el administrador puede crear pedidos para otros usuarios"
            )
        cliente = (
            db.query(Usuario)
            .filter(Usuario.id == usuario_id)
            .first()
        )
        if cliente is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
        comprador_id = cliente.id
    else:
        comprador_id = usuario_actual.id

    # Cuenta bancaria obligatoria para clientes que compran.
    if usuario_actual.rol.nombre == "cliente":
        comprador = (
            db.query(Usuario)
            .filter(Usuario.id == comprador_id)
            .first()
        )
        cuenta_completa = (
            comprador
            and comprador.cuenta_bancaria
            and comprador.banco
            and comprador.titular_cuenta
        )
        if not cuenta_completa:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debes vincular una cuenta bancaria antes de realizar un pedido"
            )

    tiene_productos = bool(datos.productos)
    tiene_servicios = bool(datos.servicios)
    if not tiene_productos and not tiene_servicios:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El pedido debe contener al menos un producto o un servicio"
        )

    total = 0
    detalles = []

    try:

        for item in datos.productos:

            producto = (
                db.query(Producto)
                .filter(
                    Producto.id == item.producto_id,
                    Producto.estado == True
                )
                .first()
            )

            if producto is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto {item.producto_id} no encontrado"
                )

            if producto.stock < item.cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Stock insuficiente para el producto "
                        f"'{producto.nombre}'. "
                        f"Stock disponible: {producto.stock}"
                    )
                )

            subtotal = producto.precio * item.cantidad

            detalle = DetallePedido(
                producto_id=producto.id,
                cantidad=item.cantidad,
                precio_unitario=producto.precio,
                subtotal=subtotal
            )

            detalles.append(detalle)

            total += subtotal

            producto.stock -= item.cantidad

        # Servicios: total = horas * valor_hora (precio del servicio)
        for item in datos.servicios:

            servicio = (
                db.query(Servicio)
                .filter(
                    Servicio.id == item.servicio_id,
                    Servicio.estado == True
                )
                .first()
            )

            if servicio is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Servicio {item.servicio_id} no encontrado"
                )

            valor_hora = servicio.precio
            subtotal = valor_hora * item.horas

            detalle = DetallePedido(
                servicio_id=servicio.id,
                horas=item.horas,
                cantidad=item.horas,
                precio_unitario=valor_hora,
                subtotal=subtotal
            )

            detalles.append(detalle)

            total += subtotal

        pedido = Pedido(
            usuario_id=comprador_id,
            total=total,
            estado="pendiente"
        )

        db.add(pedido)
        db.flush()

        for detalle in detalles:
            detalle.pedido_id = pedido.id
            db.add(detalle)

        # Generar factura automática por pedido del cliente.
        from app.models import DetalleFactura, Factura
        factura = Factura(
            pedido_id=pedido.id,
            numero=f"PSP-{datetime.utcnow():%Y%m%d}-{pedido.id:06d}",
            subtotal=total,
            impuestos=0,
            total=total,
            estado="emitida",
        )
        factura.detalles = []
        for d in detalles:
            if d.producto_id:
                descripcion = (
                    db.query(Producto).filter(Producto.id == d.producto_id).first().nombre
                    if d.producto_id
                    else "Producto"
                )
            else:
                descripcion = (
                    db.query(Servicio).filter(Servicio.id == d.servicio_id).first().nombre
                    if d.servicio_id
                    else "Servicio"
                )
            factura.detalles.append(
                DetalleFactura(
                    producto_id=d.producto_id,
                    servicio_id=d.servicio_id,
                    descripcion=descripcion,
                    cantidad=d.cantidad,
                    precio_unitario=d.precio_unitario,
                    subtotal=d.subtotal,
                )
            )
        db.add(factura)

        db.commit()
        db.refresh(pedido)

        return _serializar_pedido(db, pedido)

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo crear el pedido"
        )


@router.get(
    "/mis-pedidos",
    response_model=list[PedidoResponse]
)
def listar_mis_pedidos(
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    pedidos = (
        db.query(Pedido)
        .filter(
            Pedido.usuario_id == usuario_actual.id
        )
        .order_by(Pedido.fecha.desc())
        .all()
    )

    return [_serializar_pedido(db, p) for p in pedidos]


@router.get(
    "/{pedido_id}",
    response_model=PedidoResponse
)
def obtener_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    pedido = (
        db.query(Pedido)
        .filter(Pedido.id == pedido_id)
        .first()
    )

    if pedido is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )

    if pedido.usuario_id != usuario_actual.id:
        if usuario_actual.rol.nombre not in [
            "administrador",
            "empleado"
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para consultar este pedido"
            )

    return _serializar_pedido(db, pedido)


@router.get(
    "",
    response_model=list[PedidoResponse]
)
def listar_todos_los_pedidos(
    db: Session = Depends(get_db),
    usuario_actual=Depends(
        verificar_roles("administrador", "empleado")
    )
):
    pedidos = (
        db.query(Pedido)
        .order_by(Pedido.fecha.desc())
        .all()
    )

    return [_serializar_pedido(db, p) for p in pedidos]


@router.put(
    "/{pedido_id}/estado",
    response_model=PedidoResponse
)
def actualizar_estado_pedido(
    pedido_id: int,
    datos: PedidoEstadoUpdate,
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    # Detectar si el pedido es de servicio (algún detalle con servicio_id)
    es_servicio = any(getattr(d, "servicio_id", None) for d in pedido.detalles)

    if es_servicio:
        estados_permitidos = ["pendiente", "cancelado", "realizado"]
    else:
        estados_permitidos = ["pendiente", "procesando", "enviado", "entregado", "cancelado"]

    nuevo_estado = datos.estado.lower()

    if nuevo_estado not in estados_permitidos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estado de pedido no válido"
        )

    pedido = (
        db.query(Pedido)
        .filter(Pedido.id == pedido_id)
        .first()
    )

    if pedido is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )

    rol_nombre = usuario_actual.rol.nombre

    # Bloqueo de estados finales para servicios: realizado/cancelado no se modifican
    if es_servicio and pedido.estado in ("realizado", "cancelado"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un pedido de servicio realizado o cancelado no puede modificarse"
        )

    # ---- Reglas por rol ----
    if rol_nombre in ("administrador", "empleado"):
        # El empleado no puede cancelar pedidos
        if rol_nombre == "empleado" and nuevo_estado == "cancelado":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El empleado no puede cancelar pedidos"
            )
    else:
        # Cliente: solo su propio pedido y solo a "cancelado"
        if pedido.usuario_id != usuario_actual.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para modificar este pedido"
            )

        if nuevo_estado != "cancelado":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El cliente solo puede cancelar su pedido"
            )

        # Solo si aún no ha sido entregado ni cancelado
        if pedido.estado in ("entregado", "cancelado", "realizado"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solo se pueden cancelar pedidos que no han sido entregados"
            )

    if nuevo_estado == "cancelado" and pedido.estado != "cancelado":
        # Devolver stock al cancelar (solo productos; servicios no tienen stock)
        for detalle in pedido.detalles:
            if detalle.producto_id:
                producto = (
                    db.query(Producto)
                    .filter(Producto.id == detalle.producto_id)
                    .first()
                )
                if producto is not None:
                    producto.stock += detalle.cantidad

    pedido.estado = nuevo_estado

    db.commit()
    db.refresh(pedido)

    return _serializar_pedido(db, pedido)


@router.delete(
    "/{pedido_id}",
    status_code=status.HTTP_200_OK
)
def cancelar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    pedido = (
        db.query(Pedido)
        .filter(Pedido.id == pedido_id)
        .first()
    )

    if pedido is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )

    if pedido.usuario_id != usuario_actual.id:
        if usuario_actual.rol.nombre not in [
            "administrador",
            "empleado"
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para cancelar este pedido"
            )

    if pedido.estado != "pendiente":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden cancelar pedidos pendientes"
        )

    for detalle in pedido.detalles:

        producto = (
            db.query(Producto)
            .filter(Producto.id == detalle.producto_id)
            .first()
        )

        if producto is not None:
            producto.stock += detalle.cantidad

    pedido.estado = "cancelado"

    db.commit()

    return {
        "detail": "Pedido cancelado correctamente"
    }
