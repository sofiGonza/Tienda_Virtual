from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from fastapi.security import OAuth2PasswordBearer

from jose import JWTError
from jose import jwt

from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.database import get_db
from app.models.usuario import Usuario


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)


def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    credenciales_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    try:

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        usuario_id = payload.get("sub")

        if usuario_id is None:
            raise credenciales_exception

    except JWTError:

        raise credenciales_exception

    usuario = (
        db.query(Usuario)
        .filter(
            Usuario.id == int(usuario_id)
        )
        .first()
    )

    if usuario is None:
        raise credenciales_exception

    if not usuario.estado:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    return usuario


def verificar_roles(*roles_permitidos):

    def verificar(
        usuario: Usuario = Depends(
            obtener_usuario_actual
        )
    ):

        if usuario.rol.nombre not in roles_permitidos:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos suficientes"
            )

        return usuario

    return verificar