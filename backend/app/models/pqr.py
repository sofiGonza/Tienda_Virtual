from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database.database import Base
class PQR(Base):
    __tablename__ = "pqr"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    asunto = Column(String(150), nullable=False)
    tipo = Column(String(30), nullable=False, default="peticion")
    descripcion = Column(Text, nullable=False)
    respuesta = Column(Text, nullable=True)
    estado = Column(String(30), nullable=False, default="pendiente", index=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    usuario = relationship("Usuario", back_populates="pqrs")
