from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from app.database.database import Base
class Venta(Base):
    __tablename__ = "ventas"
    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    operador_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True, index=True)
    subtotal = Column(Numeric(12,2), nullable=False, default=0)
    descuento = Column(Numeric(12,2), nullable=False, default=0)
    impuestos = Column(Numeric(12,2), nullable=False, default=0)
    total = Column(Numeric(12,2), nullable=False, default=0)
    estado = Column(String(30), nullable=False, default="registrada", index=True)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    cliente = relationship("Usuario", foreign_keys=[cliente_id], back_populates="ventas_cliente")
    operador = relationship("Usuario", foreign_keys=[operador_id], back_populates="ventas_operadas")
    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")
    factura = relationship("Factura", back_populates="venta", uselist=False)
