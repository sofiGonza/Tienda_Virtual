from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.database.database import Base
class Conversacion(Base):
    __tablename__ = "conversaciones"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    titulo = Column(String(150), nullable=True)
    creada_en = Column(DateTime, default=datetime.utcnow, nullable=False)
    actualizada_en = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    usuario = relationship("Usuario", back_populates="conversaciones")
    mensajes = relationship("Mensaje", back_populates="conversacion", cascade="all, delete-orphan")
