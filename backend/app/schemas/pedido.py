from datetime import datetime

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import Field


class DetallePedidoCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(..., gt=0)


class DetalleServicioCreate(BaseModel):
    servicio_id: int
    horas: int = Field(..., gt=0)


class PedidoCreate(BaseModel):
    productos: list[DetallePedidoCreate]


class PedidoServicioCreate(BaseModel):
    servicios: list[DetalleServicioCreate]


class PedidoMixtoCreate(BaseModel):
    productos: list[DetallePedidoCreate] = []
    servicios: list[DetalleServicioCreate] = []


class PedidoEstadoUpdate(BaseModel):
    estado: str


class UsuarioPedidoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    correo: str
    numero_documento: str


class DetallePedidoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    producto_id: int | None = None
    servicio_id: int | None = None
    cantidad: int
    horas: int | None = None
    precio_unitario: float
    subtotal: float
    nombre: str | None = None
    precio: float | None = None


class PedidoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    total: float
    estado: str
    fecha: datetime
    detalles: list[DetallePedidoResponse] = []
    productos: list[DetallePedidoResponse] = []
    usuario: UsuarioPedidoResponse | None = None
    createdAt: datetime | None = None
