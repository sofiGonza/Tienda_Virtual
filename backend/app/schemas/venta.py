from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import Literal
class VentaItemCreate(BaseModel):
    producto_id: int | None = Field(default=None, gt=0)
    servicio_id: int | None = Field(default=None, gt=0)
    cantidad: int = Field(gt=0, le=10000)
    descuento: Decimal = Field(default=Decimal("0"), ge=0)
    @model_validator(mode="after")
    def un_item(self):
        if (self.producto_id is None) == (self.servicio_id is None): raise ValueError("Seleccione producto o servicio, pero no ambos")
        return self
class VentaCreate(BaseModel):
    cliente_id: int | None = Field(default=None, gt=0)
    items: list[VentaItemCreate] = Field(min_length=1)
    descuento: Decimal = Field(default=Decimal("0"), ge=0)
    impuesto_porcentaje: Decimal = Field(default=Decimal("0"), ge=0, le=100)
class VentaFilter(BaseModel):
    fecha_desde: datetime | None = None
    fecha_hasta: datetime | None = None
    cliente_id: int | None = Field(default=None, gt=0)
    producto_id: int | None = Field(default=None, gt=0)
    servicio_id: int | None = Field(default=None, gt=0)
    estado: str | None = None
    total_min: Decimal | None = Field(default=None, ge=0)
    total_max: Decimal | None = Field(default=None, ge=0)
    @model_validator(mode="after")
    def rango(self):
        if self.fecha_desde and self.fecha_hasta and self.fecha_desde > self.fecha_hasta: raise ValueError("Rango de fechas inválido")
        if self.total_min is not None and self.total_max is not None and self.total_min > self.total_max: raise ValueError("Rango de total inválido")
        return self
class VentaDetalleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; producto_id: int | None; servicio_id: int | None; nombre_item: str; cantidad: int; precio_unitario: Decimal; descuento: Decimal; subtotal: Decimal
class VentaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; cliente_id: int; operador_id: int | None; subtotal: Decimal; descuento: Decimal; impuestos: Decimal; total: Decimal; estado: str; fecha: datetime; detalles: list[VentaDetalleResponse] = []
