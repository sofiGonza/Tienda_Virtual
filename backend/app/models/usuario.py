from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import relationship

from app.database.database import Base


class Usuario(Base):

    __tablename__ = "usuarios"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(30),
        nullable=False
    )

    apellido = Column(
        String(30),
        nullable=False
    )

    tipo_documento = Column(
        String(20),
        nullable=False
    )

    numero_documento = Column(
        String(15),
        unique=True,
        nullable=False,
        index=True
    )

    direccion = Column(
        String(100),
        nullable=False
    )

    telefono = Column(
        String(15),
        nullable=False
    )

    correo = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    rol_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=False
    )

    estado = Column(
        Boolean,
        default=True,
        nullable=False
    )

    codigo_recuperacion = Column(
        String(10),
        nullable=True
    )

    codigo_expira = Column(
        DateTime,
        nullable=True
    )

    cuenta_bancaria = Column(
        String(40),
        nullable=True
    )

    banco = Column(
        String(60),
        nullable=True
    )

    titular_cuenta = Column(
        String(60),
        nullable=True
    )

    rol = relationship(
        "Rol",
        back_populates="usuarios"
    )

    pedidos = relationship(
        "Pedido",
        back_populates="usuario"
    )

    ventas_cliente = relationship("Venta", foreign_keys="Venta.cliente_id", back_populates="cliente")
    ventas_operadas = relationship("Venta", foreign_keys="Venta.operador_id", back_populates="operador")
    pqrs = relationship("PQR", back_populates="usuario")
    conversaciones = relationship("Conversacion", back_populates="usuario")
