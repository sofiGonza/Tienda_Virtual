"""
Factura retroactivamente los pedidos existentes que aún no tienen factura.

Uso:
    python facturar_pedidos.py            # aplica los cambios
    python facturar_pedidos.py --dry-run  # solo muestra cuántos se facturarían

Idempotente: solo procesa pedidos SIN factura asociada (facturas.pedido_id IS NULL).
"""
import sys
from datetime import datetime

from app.database.database import SessionLocal
from app.models import DetalleFactura, DetallePedido, Factura, Pedido, Producto


def pedidos_sin_factura(db):
    """Pedidos que no tienen factura vinculada por pedido_id."""
    return (
        db.query(Pedido)
        .outerjoin(Factura, Factura.pedido_id == Pedido.id)
        .filter(Factura.id.is_(None))
        .order_by(Pedido.id.asc())
        .all()
    )


def facturar_pedido(db, pedido):
    """Crea la factura del pedido y sus líneas de detalle."""
    factura = Factura(
        pedido_id=pedido.id,
        numero=f"PSP-{datetime.utcnow():%Y%m%d}-{pedido.id:06d}",
        subtotal=pedido.total,
        impuestos=0,
        total=pedido.total,
        estado="emitida",
    )
    detalles = (
        db.query(DetallePedido)
        .filter(DetallePedido.pedido_id == pedido.id)
        .all()
    )
    factura.detalles = []
    for detalle in detalles:
        nombre = "Producto"
        if detalle.producto_id:
            producto = db.query(Producto).filter(Producto.id == detalle.producto_id).first()
            if producto is not None:
                nombre = producto.nombre
        factura.detalles.append(
            DetalleFactura(
                producto_id=detalle.producto_id,
                descripcion=nombre,
                cantidad=detalle.cantidad,
                precio_unitario=detalle.precio_unitario,
                subtotal=detalle.subtotal,
            )
        )
    db.add(factura)
    return factura


def main():
    dry_run = "--dry-run" in sys.argv
    db = SessionLocal()
    try:
        pendientes = pedidos_sin_factura(db)
        print(f"Pedidos sin factura: {len(pendientes)}")

        if dry_run:
            print("Modo --dry-run: no se aplicaron cambios.")
            for p in pendientes[:10]:
                print(f"  - Pedido #{p.id} | total {p.total} | {p.estado}")
            return

        creadas = 0
        for pedido in pendientes:
            factura = facturar_pedido(db, pedido)
            db.flush()
            print(f"Factura {factura.numero} -> Pedido #{pedido.id} (${pedido.total})")
            creadas += 1
        db.commit()
        print(f"Facturas creadas: {creadas}")
    except Exception as error:  # noqa: BLE001
        db.rollback()
        print(f"Error: {error}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
