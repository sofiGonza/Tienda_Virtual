"""
Seed de usuarios y pedidos de ejemplo para Pixel Store (producción/Aiven).

Inserta:
  - Un cliente de prueba (cliente@pixelstore.com) y un empleado de prueba
    (empleado@pixelstore.com) si no existen.
  - Pedidos de ejemplo para el cliente, con historial de estados y factura,
    usando los productos sembrados por seed_productos.py.

Idempotente: se puede ejecutar varias veces sin duplicar.
Usa la misma base (DATABASE_URL / MYSQL_SSL_CA) que el backend.

Uso:
    python seed_pedidos_usuarios.py
"""
from app.database.database import SessionLocal
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.models.producto import Producto
from app.models.servicio import Servicio
from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido
from app.models.factura import Factura
from app.models.detalle_factura import DetalleFactura
from app.core.security import hash_password
from datetime import datetime, timedelta


CLIENTE = {
    "nombre": "Cliente",
    "apellido": "Demo",
    "tipo_documento": "CC",
    "numero_documento": "1234567890",
    "direccion": "Calle 1 # 2-3, Bogotá",
    "telefono": "3001112233",
    "correo": "cliente@pixelstore.com",
    "password": "Cliente123!",
    "cuenta_bancaria": "12345678901234567890",
    "banco": "Bancolombia",
    "titular_cuenta": "Cliente Demo",
}

EMPLEADO = {
    "nombre": "Empleado",
    "apellido": "Demo",
    "tipo_documento": "CC",
    "numero_documento": "9876543210",
    "direccion": "Calle 2 # 3-4, Bogotá",
    "telefono": "3004445566",
    "correo": "empleado@pixelstore.com",
    "password": "Empleado123!",
}


def _obtener_rol(db, nombre: str):
    return db.query(Rol).filter(Rol.nombre == nombre).first()


def _crear_usuario_si_no_existe(db, datos: dict, rol_nombre: str):
    usuario = db.query(Usuario).filter(Usuario.correo == datos["correo"]).first()
    if usuario is not None:
        return usuario, False

    rol = _obtener_rol(db, rol_nombre)
    if rol is None:
        raise RuntimeError(f"Rol '{rol_nombre}' no existe. Ejecuta primero el seed de roles.")

    usuario = Usuario(
        nombre=datos["nombre"],
        apellido=datos["apellido"],
        tipo_documento=datos["tipo_documento"],
        numero_documento=datos["numero_documento"],
        direccion=datos["direccion"],
        telefono=datos["telefono"],
        correo=datos["correo"],
        password_hash=hash_password(datos["password"]),
        rol_id=rol.id,
        estado=True,
        cuenta_bancaria=datos.get("cuenta_bancaria"),
        banco=datos.get("banco"),
        titular_cuenta=datos.get("titular_cuenta"),
    )
    db.add(usuario)
    db.flush()
    return usuario, True


def _crear_pedido(
    db,
    cliente: Usuario,
    producto: Producto,
    cantidad: int,
    estado: str,
    hace_dias: int,
):
    subtotal = float(producto.precio) * cantidad
    pedido = Pedido(
        usuario_id=cliente.id,
        total=subtotal,
        estado=estado,
        fecha=datetime.utcnow() - timedelta(days=hace_dias),
    )
    db.add(pedido)
    db.flush()

    detalle = DetallePedido(
        pedido_id=pedido.id,
        producto_id=producto.id,
        cantidad=cantidad,
        precio_unitario=float(producto.precio),
        subtotal=subtotal,
    )
    db.add(detalle)

    factura = Factura(
        pedido_id=pedido.id,
        numero=f"PSP-{pedido.fecha:%Y%m%d}-{pedido.id:06d}",
        fecha=pedido.fecha,
        subtotal=subtotal,
        impuestos=0,
        total=subtotal,
        estado="emitida",
    )
    db.add(factura)
    db.flush()

    db.add(
        DetalleFactura(
            factura_id=factura.id,
            producto_id=producto.id,
            descripcion=producto.nombre,
            cantidad=cantidad,
            precio_unitario=float(producto.precio),
            subtotal=subtotal,
        )
    )
    return pedido


def sembrar():
    db = SessionLocal()
    try:
        cliente, cliente_nuevo = _crear_usuario_si_no_existe(db, CLIENTE, "cliente")
        empleado, empleado_nuevo = _crear_usuario_si_no_existe(db, EMPLEADO, "empleado")
        db.flush()

        # Productos para los pedidos
        productos = (
            db.query(Producto)
            .filter(Producto.estado == True)
            .order_by(Producto.id)
            .all()
        )
        if len(productos) < 2:
            raise RuntimeError(
                "Se necesitan al menos 2 productos. Ejecuta primero seed_productos.py."
            )

        p1, p2 = productos[0], productos[1]

        # Historial de pedidos del cliente (días atrás -> recientes)
        ejemplos = [
            (p1, 2, "entregado", 12),
            (p2, 1, "enviado", 6),
            (p1, 1, "procesando", 2),
            (p2, 1, "pendiente", 0),
        ]

        creados_pedidos = 0
        for producto, cantidad, estado, dias in ejemplos:
            existe = (
                db.query(Pedido)
                .join(DetallePedido, DetallePedido.pedido_id == Pedido.id)
                .filter(
                    Pedido.usuario_id == cliente.id,
                    Pedido.estado == estado,
                    DetallePedido.producto_id == producto.id,
                )
                .first()
            )
            if existe is None:
                _crear_pedido(db, cliente, producto, cantidad, estado, dias)
                creados_pedidos += 1

        db.commit()

        print(f"Cliente demo: {'creado' if cliente_nuevo else 'ya existia'} "
              f"({CLIENTE['correo']} / {CLIENTE['password']})")
        print(f"Empleado demo: {'creado' if empleado_nuevo else 'ya existia'} "
              f"({EMPLEADO['correo']} / {EMPLEADO['password']})")
        print(f"Pedidos de ejemplo creados: {creados_pedidos}")
        print("Listo.")

    except Exception as error:
        db.rollback()
        print("ERROR:", error)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    sembrar()