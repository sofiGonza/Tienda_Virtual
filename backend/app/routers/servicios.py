from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.servicio import Servicio
from app.schemas.servicio import ServicioCreate
from app.schemas.servicio import ServicioResponse
from app.schemas.servicio import ServicioUpdate
from app.core.dependencies import verificar_roles


router = APIRouter(
    prefix="/api/servicios",
    tags=["Servicios"]
)


# ==========================================================
# LISTAR SERVICIOS (PÚBLICO)
# ==========================================================

@router.get(
    "",
    response_model=list[ServicioResponse]
)
def listar_servicios(
    db: Session = Depends(get_db)
):

    servicios = (
        db.query(Servicio)
        .filter(
            Servicio.estado == True
        )
        .all()
    )

    return servicios


# ==========================================================
# OBTENER SERVICIO POR ID (PÚBLICO)
# ==========================================================

@router.get(
    "/{servicio_id}",
    response_model=ServicioResponse
)
def obtener_servicio(
    servicio_id: int,
    db: Session = Depends(get_db)
):

    servicio = (
        db.query(Servicio)
        .filter(
            Servicio.id == servicio_id,
            Servicio.estado == True
        )
        .first()
    )

    if servicio is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado"
        )

    return servicio


# ==========================================================
# CREAR SERVICIO (ADMIN / EMPLEADO)
# ==========================================================

@router.post(
    "",
    response_model=ServicioResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_servicio(
    datos: ServicioCreate,
    db: Session = Depends(get_db),
    usuario_actual=Depends(
        verificar_roles("administrador", "empleado")
    )
):

    servicio = Servicio(
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        precio=datos.precio,
        icono=datos.icono,
        estado=datos.estado
    )

    db.add(servicio)
    db.commit()
    db.refresh(servicio)

    return servicio


# ==========================================================
# ACTUALIZAR SERVICIO (ADMIN / EMPLEADO)
# ==========================================================

@router.put(
    "/{servicio_id}",
    response_model=ServicioResponse
)
def actualizar_servicio(
    servicio_id: int,
    datos: ServicioUpdate,
    db: Session = Depends(get_db),
    usuario_actual=Depends(
        verificar_roles("administrador", "empleado")
    )
):

    servicio = (
        db.query(Servicio)
        .filter(
            Servicio.id == servicio_id
        )
        .first()
    )

    if servicio is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado"
        )

    datos_actualizados = datos.model_dump(
        exclude_unset=True
    )

    for campo, valor in datos_actualizados.items():

        setattr(
            servicio,
            campo,
            valor
        )

    db.commit()
    db.refresh(servicio)

    return servicio


# ==========================================================
# ELIMINAR SERVICIO (ADMIN)
# ==========================================================

@router.delete(
    "/{servicio_id}"
)
def eliminar_servicio(
    servicio_id: int,
    db: Session = Depends(get_db),
    usuario_actual=Depends(
        verificar_roles("administrador")
    )
):

    servicio = (
        db.query(Servicio)
        .filter(
            Servicio.id == servicio_id
        )
        .first()
    )

    if servicio is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado"
        )

    # Eliminación lógica
    servicio.estado = False

    db.commit()

    return {
        "detail": "Servicio eliminado correctamente"
    }
