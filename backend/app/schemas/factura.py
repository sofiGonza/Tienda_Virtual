from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
class FacturaFilter(BaseModel):
    numero: str | None = None
    cliente_id: int | None = Field(default=None, gt=0)
    fecha_desde: datetime | None = None
    fecha_hasta: datetime | None = None
class DetalleFacturaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; producto_id: int | None; servicio_id: int | None; descripcion: str; cantidad: int; precio_unitario: Decimal; subtotal: Decimal
class FacturaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; venta_id: int | None; pedido_id: int | None; numero: str; fecha: datetime; subtotal: Decimal; impuestos: Decimal; total: Decimal; estado: str; detalles: list[DetalleFacturaResponse] = []
    operador: dict | None = None
    tipo: str | None = None
    cliente_nombre: str | None = None
    estado_origen: str | None = None
