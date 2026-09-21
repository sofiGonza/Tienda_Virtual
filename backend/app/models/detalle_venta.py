from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from app.database.database import Base
class DetalleVenta(Base):
    __tablename__ = "detalle_ventas"
    id = Column(Integer, primary_key=True, index=True)
    venta_id = Column(Integer, ForeignKey("ventas.id", ondelete="CASCADE"), nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=True, index=True)
    servicio_id = Column(Integer, ForeignKey("servicios.id"), nullable=True, index=True)
    nombre_item = Column(String(150), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(12,2), nullable=False)
    descuento = Column(Numeric(12,2), nullable=False, default=0)
    subtotal = Column(Numeric(12,2), nullable=False)
    venta = relationship("Venta", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles_venta")
    servicio = relationship("Servicio", back_populates="detalles_venta")
