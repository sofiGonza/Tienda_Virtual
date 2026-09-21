from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import Field


class ProductoBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    descripcion: str = Field(..., max_length=500)
    categoria: str = Field(default="General", max_length=100)
    precio: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    marca: str = Field(default="Pixel Store", max_length=100)
    imagen: str | None = Field(default=None, max_length=255)
    estado: bool = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: str | None = Field(None, max_length=100)
    descripcion: str | None = Field(None, max_length=500)
    categoria: str | None = Field(None, max_length=100)
    precio: float | None = Field(None, gt=0)
    stock: int | None = Field(None, ge=0)
    marca: str | None = Field(None, max_length=100)
    imagen: str | None = Field(None, max_length=255)
    estado: bool | None = None


class ProductoResponse(ProductoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
