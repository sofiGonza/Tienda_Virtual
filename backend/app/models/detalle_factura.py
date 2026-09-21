from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from app.database.database import Base
class DetalleFactura(Base):
    __tablename__ = "detalle_facturas"
    id = Column(Integer, primary_key=True, index=True)
    factura_id = Column(Integer, ForeignKey("facturas.id", ondelete="CASCADE"), nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=True)
    servicio_id = Column(Integer, ForeignKey("servicios.id"), nullable=True)
    descripcion = Column(String(150), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(12,2), nullable=False)
    subtotal = Column(Numeric(12,2), nullable=False)
    factura = relationship("Factura", back_populates="detalles")
