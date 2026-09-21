from datetime import datetime
from datetime import timedelta
from datetime import timezone
from random import randint

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.core.email import EmailDeliveryError
from app.core.email import enviar_codigo_recuperacion
from app.core.security import create_access_token
from app.core.security import hash_password
from app.core.security import verify_password
from app.database.database import get_db
from app.models.usuario import Usuario
from app.schemas.auth import ForgotPasswordRequest
from app.schemas.auth import LoginRequest
from app.schemas.auth import LoginResponse
from app.schemas.auth import ResetPasswordRequest


router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"]
)


def _usuario_sesion(usuario: Usuario):
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "correo": usuario.correo,
        "rol": usuario.rol.nombre,
        "tipo_documento": usuario.tipo_documento,
        "numero_documento": usuario.numero_documento,
        "direccion": usuario.direccion,
        "telefono": usuario.telefono,
        "estado": usuario.estado
    }


@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    datos: LoginRequest,
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.correo == datos.correo)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    if not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario se encuentra inactivo"
        )

    if not verify_password(datos.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    rol_nombre = usuario.rol.nombre

    access_token = create_access_token(
        {
            "sub": str(usuario.id),
            "rol": rol_nombre
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": _usuario_sesion(usuario)
    }


@router.post("/forgot-password")
def forgot_password(
    datos: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.correo == datos.correo)
        .first()
    )

    mensaje = {
        "detail": "Si el correo existe, se generó un código de recuperación."
    }

    if usuario is None or not usuario.estado:
        return mensaje

    codigo = f"{randint(100000, 999999)}"

    usuario.codigo_recuperacion = codigo
    usuario.codigo_expira = datetime.now(timezone.utc) + timedelta(minutes=15)

    try:
        enviar_codigo_recuperacion(usuario.correo, codigo)
    except EmailDeliveryError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error)
        ) from error

    db.commit()
    return mensaje


@router.post("/reset-password")
def reset_password(
    datos: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.correo == datos.correo)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido o expirado"
        )

    if (
        usuario.codigo_recuperacion is None
        or usuario.codigo_recuperacion != datos.codigo
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido o expirado"
        )

    if usuario.codigo_expira is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido o expirado"
        )

    expira = usuario.codigo_expira

    if expira.tzinfo is None:
        expira = expira.replace(tzinfo=timezone.utc)

    if expira < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido o expirado"
        )

    usuario.password_hash = hash_password(datos.nuevaPassword)
    usuario.codigo_recuperacion = None
    usuario.codigo_expira = None

    db.commit()

    return {
        "detail": "Contraseña actualizada correctamente"
    }
