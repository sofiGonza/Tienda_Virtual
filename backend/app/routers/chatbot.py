from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import obtener_usuario_actual
from app.database.database import get_db
from app.models import Conversacion, Mensaje, Producto, Servicio
from app.schemas.chatbot import ChatMessageCreate, ChatMessageResponse
from app.services.chatbot import respuesta_local, respuesta_proveedor

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


@router.post("/mensaje", response_model=ChatMessageResponse)
async def mensaje(datos: ChatMessageCreate, db: Session = Depends(get_db), usuario=Depends(obtener_usuario_actual)):
    conversacion = None
    if datos.conversacion_id:
        conversacion = db.query(Conversacion).filter(Conversacion.id == datos.conversacion_id, Conversacion.usuario_id == usuario.id).first()
        if not conversacion:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")
    if conversacion is None:
        conversacion = Conversacion(usuario_id=usuario.id, titulo="Atención Pixel Store")
        db.add(conversacion)
        db.flush()
    anteriores = db.query(Mensaje).filter(Mensaje.conversacion_id == conversacion.id).order_by(Mensaje.creado_en.asc()).all()
    db.add(Mensaje(conversacion_id=conversacion.id, rol="user", contenido=datos.mensaje))
    historial = [{"role": mensaje.rol, "content": mensaje.contenido} for mensaje in anteriores]

    respuesta = await respuesta_proveedor(datos.mensaje, historial)
    if not respuesta:
        respuesta = respuesta_local(datos.mensaje, db)

    asistente = Mensaje(conversacion_id=conversacion.id, rol="assistant", contenido=respuesta)
    db.add(asistente)
    db.commit()
    db.refresh(asistente)
    return asistente
