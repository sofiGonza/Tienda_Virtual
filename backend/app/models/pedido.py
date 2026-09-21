from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database.database import Base


class Pedido(Base):

    __tablename__ = "pedidos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    total = Column(
        Float,
        nullable=False,
        default=0
    )

    estado = Column(
        String(30),
        nullable=False,
        default="pendiente"
    )

    fecha = Column(
        DateTime,
        default=datetime.utcnow
    )

    usuario = relationship(
        "Usuario",
        back_populates="pedidos"
    )

    detalles = relationship(
        "DetallePedido",
        back_populates="pedido",
        cascade="all, delete-orphan"
    )
    factura = relationship(
        "Factura",
        back_populates="pedido",
        uselist=False
    )
