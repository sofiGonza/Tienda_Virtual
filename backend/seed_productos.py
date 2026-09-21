"""
Seed de productos iniciales para Pixel Store.

Inserta cada producto solo si no existe un Producto con el mismo
nombre en la base de datos (idempotente: se puede ejecutar varias
veces sin duplicar).

Uso:
    python seed_productos.py
"""
from app.database.database import SessionLocal
from app.models.producto import Producto


PRODUCTOS_INICIALES = [
    {
        "nombre": "Portátil Gamer Nitro 5",
        "descripcion": "Portátil gamer con procesador Intel Core i5, 16 GB RAM, "
                       "SSD 512 GB y tarjeta gráfica RTX 3050. Ideal para gaming "
                       "y multitarea exigente.",
        "categoria": "Computadores",
        "precio": 4299000,
        "stock": 12,
        "marca": "Acer",
        "imagen": "/img/Productos/laptop.jpg",
    },
    {
        "nombre": "Smartphone Galaxy A54",
        "descripcion": "Celular con pantalla Super AMOLED 6.4\", cámara triple de "
                       "50 MP y batería de 5000 mAh. Rendimiento equilibrado para "
                       "el día a día.",
        "categoria": "Celulares",
        "precio": 1899000,
        "stock": 25,
        "marca": "Samsung",
        "imagen": "/img/Productos/smartphone.jpg",
    },
    {
        "nombre": "Audífonos Inalámbricos Pro",
        "descripcion": "Audífonos over-ear con cancelación activa de ruido, "
                       "bluetooth 5.3 y hasta 40 horas de batería.",
        "categoria": "Audio",
        "precio": 549000,
        "stock": 40,
        "marca": "Sony",
        "imagen": "/img/Productos/audifonos.jpg",
    },
    {
        "nombre": "Kit Gaming RGB Completo",
        "descripcion": "Setup gamer con teclado mecánico, mouse RGB, mousepad y "
                       "alfombrilla. Todo lo necesario para tu estación de juego.",
        "categoria": "Periféricos",
        "precio": 649000,
        "stock": 18,
        "marca": "Redragon",
        "imagen": "/img/Productos/setup.jpg",
    },
    {
        "nombre": "Smartwatch Serie 8",
        "descripcion": "Reloj inteligente con monitoreo de salud, GPS integrado, "
                       "resistencia al agua y notificaciones en tiempo real.",
        "categoria": "Tecnología wearable",
        "precio": 1299000,
        "stock": 15,
        "marca": "Apple",
        "imagen": "/img/Productos/reloj.png",
    },
    {
        "nombre": "PC de Escritorio Todo en Uno",
        "descripcion": "Computador de escritorio con pantalla integrada de 24\", "
                       "procesador AMD Ryzen 5, 16 GB RAM y SSD de 512 GB. "
                       "Perfecto para oficina y estudio.",
        "categoria": "Computadores",
        "precio": 3499000,
        "stock": 8,
        "marca": "HP",
        "imagen": "/img/Productos/ordenador.png",
    },
    {
        "nombre": "Mouse Gamer Inalámbrico",
        "descripcion": "Mouse ergonómico con sensor óptico de 16000 DPI, 6 botones "
                       "programables y batería de larga duración.",
        "categoria": "Periféricos",
        "precio": 189000,
        "stock": 50,
        "marca": "Logitech",
        "imagen": "/img/Productos/mouse1.jfif",
    },
    {
        "nombre": "Teclado Mecánico RGB",
        "descripcion": "Teclado mecánico con switches red, retroiluminación RGB, "
                       "anti-ghosting y estructura de aluminio.",
        "categoria": "Periféricos",
        "precio": 329000,
        "stock": 35,
        "marca": "Redragon",
        "imagen": "/img/Productos/teclado.webp",
    },
]


def sembrar_productos():
    db = SessionLocal()

    try:
        creados = 0
        existentes = 0

        for datos in PRODUCTOS_INICIALES:
            existente = (
                db.query(Producto)
                .filter(Producto.nombre == datos["nombre"])
                .first()
            )

            if existente is not None:
                existentes += 1
                continue

            db.add(
                Producto(
                    nombre=datos["nombre"],
                    descripcion=datos["descripcion"],
                    categoria=datos["categoria"],
                    precio=datos["precio"],
                    stock=datos["stock"],
                    marca=datos["marca"],
                    imagen=datos["imagen"],
                    estado=True,
                )
            )
            creados += 1

        db.commit()

        print(f"Productos creados: {creados}")
        print(f"Productos ya existentes (omitidos): {existentes}")
        print(f"Total en catálogo: {creados + existentes}")

    except Exception as error:
        db.rollback()
        print("ERROR sembrando productos:", error)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    sembrar_productos()
