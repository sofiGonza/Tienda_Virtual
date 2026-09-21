from decimal import Decimal

from app.schemas.pqr import PQRUpdate
from app.schemas.venta import VentaCreate, VentaItemCreate
from app.services.chatbot import respuesta_local
from app.services.reportes import generar_pdf_ventas, generar_xlsx_ventas


def sample_rows():
    return [{"venta_id": 7, "cliente_id": 2, "fecha": "2026-09-19", "subtotal": Decimal("100"), "impuestos": Decimal("19"), "total": Decimal("119"), "estado": "registrada"}]


def test_venta_item_exige_un_tipo():
    try:
        VentaItemCreate(cantidad=1)
    except ValueError:
        return
    assert False


def test_venta_cantidad_positiva():
    venta = VentaCreate(items=[VentaItemCreate(producto_id=1, cantidad=2)])
    assert venta.items[0].cantidad == 2


def test_pqr_estado_valido():
    assert PQRUpdate(estado="cerrada").estado == "cerrada"


def test_reportes_son_binarios_reales():
    assert generar_pdf_ventas(sample_rows()).read(4) == b"%PDF"
    assert generar_xlsx_ventas(sample_rows()).read(2) == b"PK"


def test_chatbot_fallback_local():
    assert "PQR" in respuesta_local("Necesito registrar una pqr")
