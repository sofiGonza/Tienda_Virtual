from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import relationship

from app.database.database import Base


class Producto(Base):

    __tablename__ = "productos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(100),
        nullable=False
    )

    descripcion = Column(
        String(500),
        nullable=False
    )

    categoria = Column(
        String(100),
        nullable=False,
        default="General"
    )

    precio = Column(
        Float,
        nullable=False
    )

    stock = Column(
        Integer,
        nullable=False,
        default=0
    )

    marca = Column(
        String(100),
        nullable=False,
        default="Pixel Store"
    )

    imagen = Column(
        String(255),
        nullable=True
    )

    estado = Column(
        Boolean,
        default=True,
        nullable=False
    )

    detalles_pedido = relationship(
        "DetallePedido",
        back_populates="producto"
    )

    detalles_venta = relationship("DetalleVenta", back_populates="producto")
