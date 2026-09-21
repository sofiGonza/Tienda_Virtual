from datetime import date
from pydantic import BaseModel, Field, model_validator
class ReporteVentasFilter(BaseModel):
    fecha: date | None = None
    fecha_desde: date | None = None
    fecha_hasta: date | None = None
    @model_validator(mode="after")
    def validar_fechas(self):
        if self.fecha_desde and self.fecha_hasta and self.fecha_desde > self.fecha_hasta: raise ValueError("Rango de fechas inválido")
        return self
class EstadisticasFilter(ReporteVentasFilter):
    producto_id: int | None = Field(default=None, gt=0)
    servicio_id: int | None = Field(default=None, gt=0)
    estado: str | None = None
    cliente_id: int | None = Field(default=None, gt=0)
    granularidad: str = "dia"
