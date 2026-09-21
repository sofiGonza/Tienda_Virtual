
from app.database.database import SessionLocal
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.core.security import hash_password


db = SessionLocal()

try:
    # Buscar el rol administrador
    rol_admin = (
        db.query(Rol)
        .filter(Rol.nombre == "administrador")
        .first()
    )

    # Si no existe, crearlo
    if rol_admin is None:
        rol_admin = Rol(
            nombre="administrador",
            descripcion="Administrador del sistema Pixel Store"
        )

        db.add(rol_admin)
        db.commit()
        db.refresh(rol_admin)

        print("Rol administrador creado.")

    # Comprobar si ya existe el usuario
    admin_existente = (
        db.query(Usuario)
        .filter(Usuario.correo == "admin@pixelstore.com")
        .first()
    )

    if admin_existente:
        print("El usuario administrador ya existe.")
    else:
        administrador = Usuario(
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

        db.add(administrador)
        db.commit()
        db.refresh(administrador)

        print("===================================")
        print("ADMINISTRADOR CREADO CORRECTAMENTE")
        print("===================================")
        print("Correo: admin@pixelstore.com")
        print("Contraseña: Admin123!")
        print("Rol:", rol_admin.nombre)
        print("ID:", administrador.id)

except Exception as error:
    db.rollback()
    print("ERROR:", error)

finally:
    db.close()