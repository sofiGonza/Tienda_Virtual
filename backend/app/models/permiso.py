from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey

from sqlalchemy.orm import relationship

from app.database.database import Base


class Permiso(Base):

    __tablename__ = "permisos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nombre = Column(
        String(50),
        nullable=False
    )

    descripcion = Column(
        String(255),
        nullable=True
    )

    rol_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=False
    )

    rol = relationship(
        "Rol",
        back_populates="permisos"
    )