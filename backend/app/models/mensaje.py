from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database.database import Base
class Mensaje(Base):
    __tablename__ = "mensajes"
    id = Column(Integer, primary_key=True, index=True)
    conversacion_id = Column(Integer, ForeignKey("conversaciones.id", ondelete="CASCADE"), nullable=False, index=True)
    rol = Column(String(20), nullable=False)
    contenido = Column(Text, nullable=False)
    creado_en = Column(DateTime, default=datetime.utcnow, nullable=False)
    conversacion = relationship("Conversacion", back_populates="mensajes")
