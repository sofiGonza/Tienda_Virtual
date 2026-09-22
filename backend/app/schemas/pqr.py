from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator
class PQRCreate(BaseModel):
    asunto: str = Field(min_length=3, max_length=150)
    tipo: str = Field(default="peticion", min_length=3, max_length=30)
    descripcion: str = Field(min_length=10, max_length=5000)
class PQRUpdate(BaseModel):
    estado: str | None = None
    respuesta: str | None = Field(default=None, max_length=5000)
    @field_validator("estado")
    @classmethod
    def estado_valido(cls, value):
        if value is None:
            return value
        value = value.lower()
        if value not in {"pendiente", "en_proceso", "respondida", "cerrada"}:
            raise ValueError("Estado de PQR inválido")
        return value
class PQRFilter(BaseModel):
    estado: str | None = None; tipo: str | None = None; usuario_id: int | None = Field(default=None, gt=0)
class PQRResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; usuario_id: int; asunto: str; tipo: str; descripcion: str; respuesta: str | None; estado: str; fecha_creacion: datetime; fecha_actualizacion: datetime
    usuario_nombre: str | None = None
