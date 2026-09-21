from pydantic import BaseModel
from pydantic import EmailStr
from pydantic import Field


class LoginRequest(BaseModel):
    correo: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    usuario: dict


class ForgotPasswordRequest(BaseModel):
    correo: EmailStr


class ResetPasswordRequest(BaseModel):
    correo: EmailStr
    codigo: str = Field(..., min_length=4, max_length=10)
    nuevaPassword: str = Field(..., min_length=6, max_length=72)
