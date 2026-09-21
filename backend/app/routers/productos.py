from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate
from app.schemas.producto import ProductoUpdate
from app.schemas.producto import ProductoResponse
from app.core.dependencies import verificar_roles


router = APIRouter(
    prefix="/api/productos",
    tags=["Productos"]
)


# ==========================================================
# LISTAR PRODUCTOS
# ==========================================================

@router.get(
    "",
    response_model=list[ProductoResponse]
)
def listar_productos(
    categoria: str | None = None,
    db: Session = Depends(get_db)
):

    consulta = db.query(Producto).filter(
        Producto.estado == True
    )

    if categoria:
        consulta = consulta.filter(
            Producto.categoria == categoria
        )

    productos = consulta.all()

    return productos


# ==========================================================
# OBTENER PRODUCTO POR ID
# ==========================================================

@router.get(
    "/{producto_id}",
    response_model=ProductoResponse
)
def obtener_producto(
    producto_id: int,
    categoria: str | None = None,
    db: Session = Depends(get_db)
):

    consulta = db.query(Producto).filter(
        Producto.id == producto_id,
        Producto.estado == True
    )

    if categoria:
        consulta = consulta.filter(
            Producto.categoria == categoria
        )

    producto = consulta.first()

    if producto is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    return producto


# ==========================================================
# CREAR PRODUCTO
# ==========================================================

@router.post(
    "",
    response_model=ProductoResponse,
    status_code=status.HTTP_201_CREATED
)
def crear_producto(
    datos: ProductoCreate,
    db: Session = Depends(get_db),
    usuario_actual=Depends(
        verificar_roles("administrador", "empleado")
    )
):

    producto = Producto(
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        categoria=datos.categoria,
        precio=datos.precio,
        stock=datos.stock,
        marca=datos.marca,
        estado=datos.estado
    )

    db.add(producto)
    db.commit()
    db.refresh(producto)

    return producto


# ==========================================================
# ACTUALIZAR PRODUCTO
# ==========================================================

@router.put(
    "/{producto_id}",
    response_model=ProductoResponse
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    db: Session = Depends(get_db),
    usuario_actual=Depends(
        verificar_roles("administrador", "empleado")
    )
):

    producto = (
        db.query(Producto)
        .filter(
            Producto.id == producto_id
        )
        .first()
    )

    if producto is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    datos_actualizados = datos.model_dump(
        exclude_unset=True
    )

    for campo, valor in datos_actualizados.items():

        setattr(
            producto,
            campo,
            valor
        )

    db.commit()
    db.refresh(producto)

    return producto


# ==========================================================
# ELIMINAR PRODUCTO
# ==========================================================

@router.delete(
    "/{producto_id}"
)
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    usuario_actual=Depends(
        verificar_roles("administrador")
    )
):

    producto = (
        db.query(Producto)
        .filter(
            Producto.id == producto_id
        )
        .first()
    )

    if producto is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )

    # Eliminación lógica
    producto.estado = False

    db.commit()

    return {
        "detail": "Producto eliminado correctamente"
    }