from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import relationship

from app.database.database import Base


class Rol(Base):

    __tablename__ = "roles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(30),
        unique=True,
        nullable=False
    )

    descripcion = Column(
        String(255),
        nullable=True
    )

    usuarios = relationship(
        "Usuario",
        back_populates="rol"
    )

    permisos = relationship(
        "Permiso",
        back_populates="rol"
    )