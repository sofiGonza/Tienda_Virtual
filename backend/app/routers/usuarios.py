from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from app.core.dependencies import obtener_usuario_actual
from app.core.dependencies import verificar_roles
from app.core.security import hash_password
from app.core.security import verify_password
from app.database.database import get_db
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreateAdmin
from app.schemas.usuario import CuentaBancariaResponse
from app.schemas.usuario import CuentaBancariaUpdate
from app.schemas.usuario import UsuarioEstado
from app.schemas.usuario import UsuarioPassword
from app.schemas.usuario import UsuarioRegistro
from app.schemas.usuario import UsuarioResponse
from app.schemas.usuario import UsuarioRol
from app.schemas.usuario import UsuarioUpdate


router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"]
)


def _obtener_rol(db: Session, nombre: str) -> Rol:
    rol = (
        db.query(Rol)
        .filter(Rol.nombre == nombre.lower())
        .first()
    )

    if rol is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El rol '{nombre}' no existe"
        )

    return rol


def _correo_o_documento_duplicado(
    db: Session,
    correo: str,
    numero_documento: str,
    usuario_id: int | None = None
):
    correo_existente = (
        db.query(Usuario)
        .filter(Usuario.correo == correo)
        .first()
    )

    if correo_existente and correo_existente.id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado"
        )

    documento_existente = (
        db.query(Usuario)
        .filter(Usuario.numero_documento == numero_documento)
        .first()
    )

    if documento_existente and documento_existente.id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El documento ya está registrado"
        )


@router.post(
    "/registro",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED
)
def registrar_usuario(
    datos: UsuarioRegistro,
    db: Session = Depends(get_db)
):
    _correo_o_documento_duplicado(
        db,
        datos.correo,
        datos.numero_documento
    )

    rol_cliente = _obtener_rol(db, "cliente")

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        tipo_documento=datos.tipo_documento,
        numero_documento=datos.numero_documento,
        direccion=datos.direccion,
        telefono=datos.telefono,
        correo=datos.correo,
        password_hash=hash_password(datos.password),
        rol_id=rol_cliente.id,
        estado=True
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario


@router.post(
    "",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_usuario_admin(
    datos: UsuarioCreateAdmin,
    db: Session = Depends(get_db),
    usuario_actual=Depends(verificar_roles("administrador"))
):
    _correo_o_documento_duplicado(
        db,
        datos.correo,
        datos.numero_documento
    )

    rol = _obtener_rol(db, datos.rol)

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        tipo_documento=datos.tipo_documento,
        numero_documento=datos.numero_documento,
        direccion=datos.direccion,
        telefono=datos.telefono,
        correo=datos.correo,
        password_hash=hash_password(datos.password),
        rol_id=rol.id,
        estado=datos.estado
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario


@router.get(
    "",
    response_model=list[UsuarioResponse]
)
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario_actual=Depends(verificar_roles("administrador"))
):
    return (
        db.query(Usuario)
        .options(joinedload(Usuario.rol))
        .all()
    )


@router.get(
    "/{usuario_id}",
    response_model=UsuarioResponse
)
def obtener_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario_actual=Depends(
        verificar_roles("administrador", "empleado")
    )
):
    usuario = (
        db.query(Usuario)
        .options(joinedload(Usuario.rol))
        .filter(Usuario.id == usuario_id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    if usuario_actual.rol.nombre == "empleado":
        if usuario.rol.nombre != "cliente":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos suficientes"
            )

    return usuario


@router.put(
    "/{usuario_id}",
    response_model=UsuarioResponse
)
def actualizar_usuario(
    usuario_id: int,
    datos: UsuarioUpdate,
    db: Session = Depends(get_db),
    usuario_actual=Depends(verificar_roles("administrador"))
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == usuario_id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    actualizacion = datos.model_dump(exclude_unset=True)
    rol_nombre = actualizacion.pop("rol", None)
    password = actualizacion.pop("password", None)

    correo = actualizacion.get("correo", usuario.correo)
    documento = actualizacion.get(
        "numero_documento",
        usuario.numero_documento
    )

    _correo_o_documento_duplicado(
        db,
        correo,
        documento,
        usuario.id
    )

    for campo, valor in actualizacion.items():
        setattr(usuario, campo, valor)

    if rol_nombre:
        usuario.rol_id = _obtener_rol(db, rol_nombre).id

    if password:
        usuario.password_hash = hash_password(password)

    db.commit()
    db.refresh(usuario)

    return usuario


@router.put(
    "/{usuario_id}/rol",
    response_model=UsuarioResponse
)
def actualizar_rol(
    usuario_id: int,
    datos: UsuarioRol,
    db: Session = Depends(get_db),
    usuario_actual=Depends(verificar_roles("administrador"))
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == usuario_id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    usuario.rol_id = _obtener_rol(db, datos.rol).id
    db.commit()
    db.refresh(usuario)

    return usuario


@router.patch(
    "/{usuario_id}/estado",
    response_model=UsuarioResponse
)
@router.put(
    "/{usuario_id}/estado",
    response_model=UsuarioResponse
)
def cambiar_estado(
    usuario_id: int,
    datos: UsuarioEstado,
    db: Session = Depends(get_db),
    usuario_actual=Depends(verificar_roles("administrador"))
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == usuario_id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    if usuario.id == usuario_actual.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes cambiar tu propio estado"
        )

    usuario.estado = datos.estado
    db.commit()
    db.refresh(usuario)

    return usuario


@router.put("/{usuario_id}/password")
def cambiar_password(
    usuario_id: int,
    datos: UsuarioPassword,
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    if (
        usuario_actual.id != usuario_id
        and usuario_actual.rol.nombre != "administrador"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos suficientes"
        )

    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == usuario_id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    if usuario_actual.id == usuario_id:
        if not verify_password(
            datos.passwordActual,
            usuario.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La contraseña actual es incorrecta"
            )

    usuario.password_hash = hash_password(datos.passwordNueva)
    db.commit()

    return {
        "detail": "Contraseña actualizada correctamente"
    }


@router.delete("/{usuario_id}")
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario_actual=Depends(verificar_roles("administrador"))
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == usuario_id)
        .first()
    )

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    if usuario.id == usuario_actual.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propio usuario"
        )

    usuario.estado = False
    db.commit()

    return {
        "detail": "Usuario desactivado correctamente"
    }


@router.get(
    "/me/cuenta",
    response_model=CuentaBancariaResponse
)
def obtener_mi_cuenta(
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    return usuario_actual


@router.put(
    "/me/cuenta",
    response_model=CuentaBancariaResponse
)
def actualizar_mi_cuenta(
    datos: CuentaBancariaUpdate,
    db: Session = Depends(get_db),
    usuario_actual=Depends(obtener_usuario_actual)
):
    if datos.cuenta_bancaria is not None:
        usuario_actual.cuenta_bancaria = (datos.cuenta_bancaria or "").strip() or None
    if datos.banco is not None:
        usuario_actual.banco = (datos.banco or "").strip() or None
    if datos.titular_cuenta is not None:
        usuario_actual.titular_cuenta = (datos.titular_cuenta or "").strip() or None

    db.commit()
    db.refresh(usuario_actual)

    return usuario_actual
