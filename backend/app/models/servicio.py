from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import relationship

from app.database.database import Base


class Servicio(Base):

    __tablename__ = "servicios"

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

    precio = Column(
        Float,
        nullable=False,
        default=0
    )

    icono = Column(
        String(50),
        nullable=True
    )

    estado = Column(
        Boolean,
        default=True,
        nullable=False
    )

    detalles_venta = relationship("DetalleVenta", back_populates="servicio")

    detalles_pedido = relationship(
        "DetallePedido",
        back_populates="servicio"
    )
