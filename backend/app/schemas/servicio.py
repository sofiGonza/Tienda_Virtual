from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import Field


class ServicioBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    descripcion: str = Field(..., max_length=500)
    precio: float = Field(..., ge=0)
    icono: str | None = Field(default=None, max_length=50)
    estado: bool = True


class ServicioCreate(ServicioBase):
    pass


class ServicioUpdate(BaseModel):
    nombre: str | None = Field(None, max_length=100)
    descripcion: str | None = Field(None, max_length=500)
    precio: float | None = Field(None, ge=0)
    icono: str | None = Field(None, max_length=50)
    estado: bool | None = None


class ServicioResponse(ServicioBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
