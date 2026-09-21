from io import BytesIO
from decimal import Decimal

import httpx
from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image as RLImage,
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# Paleta Pixel Store
AZUL_OSCURO = colors.HexColor("#0f172a")
AZUL_MEDIO = colors.HexColor("#0e7490")
CIAN = colors.HexColor("#22d3ee")
GRIS_TEXTO = colors.HexColor("#475569")
GRIS_SUAVE = colors.HexColor("#f1f5f8")
BLANCO = colors.white
NEGRO = colors.HexColor("#0f172a")

TITULO = ParagraphStyle("titulo", fontName="Helvetica-Bold", fontSize=26, textColor=AZUL_MEDIO, leading=30)
SUBTITULO = ParagraphStyle("subtitulo", fontName="Helvetica", fontSize=10, textColor=GRIS_TEXTO, leading=14)
ENCABEZADO_NUM = ParagraphStyle("encabezado_num", fontName="Helvetica-Bold", fontSize=20, textColor=BLANCO, leading=24)
ENCABEZADO_SUB = ParagraphStyle("encabezado_sub", fontName="Helvetica", fontSize=10, textColor=colors.HexColor("#cbd5e1"), leading=14)
LABEL = ParagraphStyle("label", fontName="Helvetica-Bold", fontSize=9, textColor=GRIS_TEXTO, leading=12)
VALOR = ParagraphStyle("valor", fontName="Helvetica", fontSize=11, textColor=NEGRO, leading=14)
CELDA = ParagraphStyle("celda", fontName="Helvetica", fontSize=10, textColor=NEGRO, leading=13)
CELDA_BOLD = ParagraphStyle("celda_bold", fontName="Helvetica-Bold", fontSize=10, textColor=NEGRO, leading=13)
CELDA_TITULO = ParagraphStyle("celda_titulo", fontName="Helvetica-Bold", fontSize=10, textColor=BLANCO, leading=13)
GRACIAS = ParagraphStyle("gracias", fontName="Helvetica-Bold", fontSize=16, textColor=AZUL_MEDIO, leading=20)


def _par(texto, estilo):
    return Paragraph(str(texto), estilo)


LOGO_PATH = None
LOGO_CIRCLE_PATH = None
try:
    from pathlib import Path
    _raiz = Path(__file__).resolve().parent.parent / "static"
    _logo = _raiz / "logoPixel.png"
    _circle = _raiz / "logoPixel_circle.png"
    if _logo.exists():
        LOGO_PATH = str(_logo)
    if _circle.exists():
        LOGO_CIRCLE_PATH = str(_circle)
except Exception:
    pass


def _logo_pdf() -> RLImage | None:
    """Devuelve el RLImage del logo circular o None si no se pudo cargar."""
    ruta = LOGO_CIRCLE_PATH or LOGO_PATH
    if not ruta:
        return None
    try:
        from PIL import Image as PILImage
        imagen = PILImage.open(ruta)
        if imagen.mode != "RGBA":
            imagen = imagen.convert("RGBA")
        buffer = BytesIO()
        imagen.save(buffer, format="PNG")
        buffer.seek(0)
        rl = RLImage(buffer, width=0.62 * inch, height=0.62 * inch)
        rl.hAlign = "LEFT"
        return rl
    except Exception:
        return None


def _descargar_imagen(url: str, max_px: int = 220) -> Image.Image | None:
    """Descarga una imagen remota y la devuelve como Pillow (RGB)."""
    if not url:
        return None
    try:
        with httpx.Client(timeout=6, follow_redirects=True) as cliente:
            respuesta = cliente.get(url)
            respuesta.raise_for_status()
        imagen = Image.open(BytesIO(respuesta.content))
        imagen.thumbnail((max_px, max_px))
        if imagen.mode != "RGB":
            imagen = imagen.convert("RGB")
        return imagen
    except Exception:
        return None


def _imagen_factura(url: str | None) -> RLImage | None:
    """Devuelve el RLImage de la imagen del producto o None si no se pudo obtener."""
    if not url:
        return None
    imagen = _descargar_imagen(url)
    if imagen is None:
        return None
    buffer = BytesIO()
    imagen.save(buffer, format="PNG")
    buffer.seek(0)
    ancho, alto = imagen.size
    max_ancho = 0.9 * inch
    factor = max_ancho / ancho
    rl = RLImage(buffer, width=max_ancho, height=alto * factor)
    rl.hAlign = "LEFT"
    return rl


def _porcentaje_impuesto(factura) -> int:
    """Calcula el porcentaje de impuesto mostrado: 0 si no hay, o el porcentaje real."""
    subtotal = Decimal(str(factura.subtotal or 0))
    impuestos = Decimal(str(factura.impuestos or 0))
    if subtotal <= 0 or impuestos <= 0:
        return 0
    return int(round((impuestos / subtotal) * 100))


def factura_pdf(factura):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=46,
        leftMargin=46,
        topMargin=40,
        bottomMargin=40,
    )

    venta = factura.venta
    pedido = factura.pedido
    cliente = (venta.cliente if venta else None) or (pedido.usuario if pedido else None)
    cliente_nombre = f"{cliente.nombre} {cliente.apellido}" if cliente else "Cliente"
    cliente_correo = cliente.correo if cliente else ""
    cliente_direccion = cliente.direccion if cliente else ""
    cliente_documento = f"{cliente.tipo_documento} {cliente.numero_documento}" if cliente else ""
    operador = venta.operador if (venta and venta.operador) else None
    operador_nombre = f"{operador.nombre} {operador.apellido}" if operador else None

    # Cabecera: logo circular pequeño + nombre al lado, FACTURA + NO° a la derecha
    logo = _logo_pdf()
    if logo is not None:
        celda_izq = [logo, _par("PIXEL STORE", TITULO), _par("Tecnología que conecta contigo", SUBTITULO)]
    else:
        celda_izq = [_par("PIXEL STORE", TITULO), _par("Tecnología que conecta contigo", SUBTITULO)]
    cabecera = Table(
        [
            [
                celda_izq,
                [_par("FACTURA", ENCABEZADO_NUM), _par(f"NO° {factura.numero}", ENCABEZADO_SUB)],
            ]
        ],
        colWidths=[3.4 * inch, 2.6 * inch],
    )
    cabecera.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (1, 0), (1, 0), AZUL_OSCURO),
        ("TOPPADDING", (1, 0), (1, 0), 14),
        ("BOTTOMPADDING", (1, 0), (1, 0), 14),
        ("LEFTPADDING", (1, 0), (1, 0), 18),
        ("ROUNDEDCORNERS", [8, 8, 8, 8]),
    ]))

    # Datos del cliente
    fila_operador = [_par(f"Añadida por: {operador_nombre}", VALOR), _par("", VALOR)] if operador_nombre else [_par("", VALOR), _par("", VALOR)]
    cliente_tabla = Table(
        [
            [_par("CLIENTE", LABEL), _par("", LABEL)],
            [_par(cliente_nombre, VALOR), _par(f"Correo: {cliente_correo}", VALOR)],
            [_par(f"Dirección: {cliente_direccion}", VALOR), _par(f"Documento: {cliente_documento}", VALOR)],
            fila_operador,
        ],
        colWidths=[3.0 * inch, 3.0 * inch],
    )
    cliente_tabla.setStyle(TableStyle([
        ("SPAN", (1, 0), (1, 0)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))

    # Tabla de artículos (sin foto de producto)
    data = [
        [_par("Artículo", CELDA_TITULO), _par("Cantidad/Horas", CELDA_TITULO), _par("Precio/u", CELDA_TITULO), _par("Total", CELDA_TITULO)]
    ]
    for detalle in factura.detalles:
        data.append([
            _par(detalle.descripcion, CELDA),
            _par(str(detalle.cantidad), CELDA),
            _par(f"${Decimal(str(detalle.precio_unitario)):,.0f}", CELDA),
            _par(f"${Decimal(str(detalle.subtotal)):,.0f}", CELDA),
        ])
    tabla = Table(data, repeatRows=1, colWidths=[2.7 * inch, 1.2 * inch, 1.1 * inch, 1.1 * inch])
    tabla.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), AZUL_OSCURO),
        ("TEXTCOLOR", (0, 0), (-1, 0), BLANCO),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#e2e8f0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [BLANCO, GRIS_SUAVE]),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))

    # Totales con porcentaje correcto
    porcentaje = _porcentaje_impuesto(factura)
    totales = Table(
        [
            [_par("", CELDA), _par("Subtotal:", CELDA_BOLD), _par(f"${Decimal(str(factura.subtotal)):,.0f}", CELDA)],
            [_par("", CELDA), _par(f"Impuestos ({porcentaje} %):", CELDA_BOLD), _par(f"${Decimal(str(factura.impuestos)):,.0f}", CELDA)],
            [_par("", CELDA), _par("Precio total:", CELDA_BOLD), _par(f"${Decimal(str(factura.total)):,.0f}", CELDA)],
        ],
        colWidths=[2.2 * inch, 2.2 * inch, 1.6 * inch],
    )
    totales.setStyle(TableStyle([
        ("ALIGN", (1, 0), (2, -1), "RIGHT"),
        ("TEXTCOLOR", (2, 0), (2, -1), AZUL_MEDIO),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("LINEBELOW", (0, 2), (2, 2), 1.5, CIAN),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))

    pie = Table(
        [
            [_par("¡GRACIAS!", GRACIAS),
             _par("Visita pixelstore.com · contacto@pixelstore.com", SUBTITULO)],
        ],
        colWidths=[3.0 * inch, 3.0 * inch],
    )
    pie.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (0, 0), "LEFT"),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 18),
    ]))

    story = [
        cabecera,
        Spacer(1, 18),
        cliente_tabla,
        Spacer(1, 18),
        tabla,
        Spacer(1, 14),
        totales,
        pie,
    ]
    doc.build(story)
    buffer.seek(0)
    return buffer
