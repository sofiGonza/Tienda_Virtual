from sqlalchemy import inspect
from sqlalchemy import text

from app.core.security import hash_password
from app.database.database import Base
from app.database.database import SessionLocal
from app.database.database import engine

from app.models import (
    DetallePedido,
    Pedido,
    Permiso,
    Producto,
    Rol,
    Servicio,
    Usuario,
)


ROLES_INICIALES = [
    ("administrador", "Administrador del sistema Pixel Store"),
    ("empleado", "Empleado de Pixel Store"),
    ("cliente", "Cliente de Pixel Store"),
]

SERVICIOS_INICIALES = [
    (
        "Mantenimiento de computadores",
        "Realizamos mantenimiento preventivo y correctivo para mejorar el rendimiento y prolongar la vida útil de tus computadores.",
        80000,
        "laptop",
    ),
    (
        "Instalación de software",
        "Instalamos y configuramos programas y herramientas necesarias para tus actividades académicas, laborales o personales.",
        50000,
        "download",
    ),
    (
        "Configuración de equipos",
        "Configuramos computadores y dispositivos tecnológicos para que funcionen correctamente y se adapten a tus necesidades.",
        60000,
        "cog",
    ),
    (
        "Asesoría tecnológica",
        "Te ayudamos a elegir equipos, accesorios y soluciones tecnológicas de acuerdo con tus necesidades y presupuesto.",
        40000,
        "lightbulb",
    ),
    (
        "Soporte técnico",
        "Ofrecemos asistencia para solucionar problemas de software, configuración y funcionamiento de tus dispositivos.",
        55000,
        "tools",
    ),
]


def crear_tablas():
    Base.metadata.create_all(bind=engine)
    _agregar_columnas_faltantes()


def _agregar_columnas_faltantes():
    inspector = inspect(engine)
    tablas = inspector.get_table_names()

    with engine.begin() as conexion:
        if "usuarios" in tablas:
            columnas = {
                columna["name"]
                for columna in inspector.get_columns("usuarios")
            }

            if "codigo_recuperacion" not in columnas:
                conexion.execute(
                    text(
                        "ALTER TABLE usuarios "
                        "ADD COLUMN codigo_recuperacion VARCHAR(10) NULL"
                    )
                )

            if "codigo_expira" not in columnas:
                conexion.execute(
                    text(
                        "ALTER TABLE usuarios "
                        "ADD COLUMN codigo_expira DATETIME NULL"
                    )
                )

        if "productos" in tablas:
            columnas = {
                columna["name"]
                for columna in inspector.get_columns("productos")
            }

            if "imagen" not in columnas:
                conexion.execute(
                    text(
                        "ALTER TABLE productos "
                        "ADD COLUMN imagen VARCHAR(255) NULL"
                    )
                )


def sembrar_datos():
    db = SessionLocal()

    try:
        for nombre, descripcion in ROLES_INICIALES:
            existente = (
                db.query(Rol)
                .filter(Rol.nombre == nombre)
                .first()
            )

            if existente is None:
                db.add(
                    Rol(
                        nombre=nombre,
                        descripcion=descripcion
                    )
                )

        db.commit()

        rol_admin = (
            db.query(Rol)
            .filter(Rol.nombre == "administrador")
            .first()
        )

        rol_empleado = (
            db.query(Rol)
            .filter(Rol.nombre == "empleado")
            .first()
        )

        if rol_admin:
            admin = (
                db.query(Usuario)
                .filter(Usuario.correo == "admin@pixelstore.com")
                .first()
            )

            if admin is None:
                db.add(
                    Usuario(
                        nombre="Administrador",
                        apellido="Pixel Store",
                        tipo_documento="CC",
                        numero_documento="9999999999",
                        direccion="Pixel Store",
                        telefono="3000000000",
                        correo="admin@pixelstore.com",
                        password_hash=hash_password("Admin123!"),
                        rol_id=rol_admin.id,
                        estado=True
                    )
                )

        if rol_empleado:
            empleado = (
                db.query(Usuario)
                .filter(Usuario.correo == "empleado@pixelstore.com")
                .first()
            )

            if empleado is None:
                db.add(
                    Usuario(
                        nombre="Empleado",
                        apellido="Pixel Store",
                        tipo_documento="CC",
                        numero_documento="8888888888",
                        direccion="Pixel Store",
                        telefono="3000000001",
                        correo="empleado@pixelstore.com",
                        password_hash=hash_password("Empleado123!"),
                        rol_id=rol_empleado.id,
                        estado=True
                    )
                )

        for nombre, descripcion, precio, icono in SERVICIOS_INICIALES:
            existente = (
                db.query(Servicio)
                .filter(Servicio.nombre == nombre)
                .first()
            )

            if existente is None:
                db.add(
                    Servicio(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio=precio,
                        icono=icono,
                        estado=True
                    )
                )

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
