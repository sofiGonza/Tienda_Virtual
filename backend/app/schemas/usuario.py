from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import EmailStr
from pydantic import Field


class UsuarioRegistro(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=30)
    apellido: str = Field(..., min_length=2, max_length=30)
    tipo_documento: str = Field(..., min_length=2, max_length=20)
    numero_documento: str = Field(..., min_length=5, max_length=15)
    direccion: str = Field(..., min_length=5, max_length=100)
    telefono: str = Field(..., min_length=7, max_length=15)
    correo: EmailStr
    password: str = Field(..., min_length=6, max_length=72)


class UsuarioCreateAdmin(UsuarioRegistro):
    rol: str = "cliente"
    estado: bool = True


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=30)
    apellido: Optional[str] = Field(None, min_length=2, max_length=30)
    tipo_documento: Optional[str] = Field(None, min_length=2, max_length=20)
    numero_documento: Optional[str] = Field(None, min_length=5, max_length=15)
    direccion: Optional[str] = Field(None, min_length=5, max_length=100)
    telefono: Optional[str] = Field(None, min_length=7, max_length=15)
    correo: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=72)
    rol: Optional[str] = None


class UsuarioEstado(BaseModel):
    estado: bool


class UsuarioRol(BaseModel):
    rol: str


class UsuarioPassword(BaseModel):
    passwordActual: str = Field(..., min_length=1)
    passwordNueva: str = Field(..., min_length=6, max_length=72)


class CuentaBancariaUpdate(BaseModel):
    cuenta_bancaria: Optional[str] = Field(None, max_length=40)
    banco: Optional[str] = Field(None, max_length=60)
    titular_cuenta: Optional[str] = Field(None, max_length=60)


class CuentaBancariaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cuenta_bancaria: Optional[str] = None
    banco: Optional[str] = None
    titular_cuenta: Optional[str] = None


class RolResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str


class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    tipo_documento: str
    numero_documento: str
    direccion: str
    telefono: str
    correo: EmailStr
    rol_id: int
    estado: bool
    rol: RolResponse
