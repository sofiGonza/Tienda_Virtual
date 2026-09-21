from sqlalchemy import Column
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy import Integer

from sqlalchemy.orm import relationship

from app.database.database import Base


class DetallePedido(Base):

    __tablename__ = "detalle_pedidos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    pedido_id = Column(
        Integer,
        ForeignKey("pedidos.id"),
        nullable=False
    )

    producto_id = Column(
        Integer,
        ForeignKey("productos.id"),
        nullable=True
    )

    servicio_id = Column(
        Integer,
        ForeignKey("servicios.id"),
        nullable=True
    )

    horas = Column(
        Integer,
        nullable=True
    )

    cantidad = Column(
        Integer,
        nullable=False
    )

    precio_unitario = Column(
        Float,
        nullable=False
    )

    subtotal = Column(
        Float,
        nullable=False
    )

    pedido = relationship(
        "Pedido",
        back_populates="detalles"
    )

    producto = relationship(
        "Producto",
        back_populates="detalles_pedido"
    )

    servicio = relationship(
        "Servicio",
        back_populates="detalles_pedido"
    )