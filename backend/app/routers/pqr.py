from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import obtener_usuario_actual
from app.core.email import EmailDeliveryError
from app.core.email import enviar_pqr_respondida
from app.database.database import get_db
from app.models import PQR
from app.models import Usuario
from app.schemas.pqr import PQRCreate, PQRUpdate, PQRResponse

router = APIRouter(prefix="/api/pqr", tags=["PQR"])


@router.post("", response_model=PQRResponse, status_code=201)
def crear(d: PQRCreate, db: Session = Depends(get_db), u=Depends(obtener_usuario_actual)):
    x = PQR(usuario_id=u.id, **d.model_dump())
    x.usuario_nombre = f"{u.nombre} {u.apellido}".strip() or u.correo
    db.add(x)
    db.commit()
    db.refresh(x)
    return x


@router.get("", response_model=list[PQRResponse])
def listar(db: Session = Depends(get_db), u=Depends(obtener_usuario_actual)):
    q = db.query(PQR)
    if u.rol.nombre == "cliente":
        q = q.filter(PQR.usuario_id == u.id)
    items = q.order_by(PQR.fecha_creacion.desc()).all()
    for x in items:
        if x.usuario:
            x.usuario_nombre = f"{x.usuario.nombre} {x.usuario.apellido}".strip() or x.usuario.correo
    return items


@router.patch("/{id}", response_model=PQRResponse)
def actualizar(id: int, d: PQRUpdate, db: Session = Depends(get_db), u=Depends(obtener_usuario_actual)):
    x = db.query(PQR).filter(PQR.id == id).first()
    if not x:
        raise HTTPException(404, "PQR no encontrada")
    if u.rol.nombre == "cliente" and x.usuario_id != u.id:
        raise HTTPException(403, "No tienes permiso")
    if u.rol.nombre == "cliente" and d.estado not in (None, "cerrada"):
        raise HTTPException(403, "El cliente solo puede cerrar su PQR")
    # Una PQR cerrada no se puede volver a modificar (estado ni respuesta).
    if x.estado == "cerrada":
        raise HTTPException(400, "La PQR ya está cerrada y no se puede modificar")

    cambios = d.model_dump(exclude_none=True)
    for k, v in cambios.items():
        setattr(x, k, v)

    fue_respondida = cambios.get("estado") == "respondida" or (cambios.get("respuesta") and x.estado in ("pendiente", "en_proceso"))
    if fue_respondida and x.estado not in ("respondida", "cerrada"):
        x.estado = "respondida"

    db.commit()
    db.refresh(x)

    if fue_respondida:
        cliente = db.query(Usuario).filter(Usuario.id == x.usuario_id).first()
        enlace = f"{settings.FRONTEND_URL}/panel/pqr"
        if cliente:
            try:
                enviar_pqr_respondida(cliente.correo, x.asunto, enlace)
            except EmailDeliveryError as error:
                db.rollback()
                raise HTTPException(500, str(error)) from error

    return x
