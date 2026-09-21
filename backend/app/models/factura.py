from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from app.database.database import Base
class Factura(Base):
    __tablename__ = "facturas"
    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id"), nullable=True, unique=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=True, unique=True)
    numero = Column(String(40), nullable=False, unique=True, index=True)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    subtotal = Column(Numeric(12,2), nullable=False, default=0)
    impuestos = Column(Numeric(12,2), nullable=False, default=0)
    total = Column(Numeric(12,2), nullable=False, default=0)
    estado = Column(String(30), nullable=False, default="emitida")
    venta = relationship("Venta", back_populates="factura")
    pedido = relationship("Pedido", back_populates="factura")
    detalles = relationship("DetalleFactura", back_populates="factura", cascade="all, delete-orphan")
