import httpx

from app.core.config import settings
from app.models import Producto, Servicio

FAQ = {
    "horario": "Atendemos de lunes a sábado de 8:00 a.m. a 6:00 p.m.",
    "envios": "Los pedidos se gestionan desde el panel del cliente.",
    "pqr": "Puedes registrar una PQR desde el módulo PQR.",
}


def _linea_productos(db, limite=12):
    productos = (
        db.query(Producto)
        .filter(Producto.estado == True)
        .order_by(Producto.nombre)
        .limit(limite)
        .all()
    )
    if not productos:
        return "No hay productos disponibles por el momento."
    return "\n".join(f"- {p.nombre} (${p.precio:,.2f}, stock {p.stock})" for p in productos)


def _linea_servicios(db, limite=8):
    servicios = (
        db.query(Servicio)
        .filter(Servicio.estado == True)
        .order_by(Servicio.nombre)
        .limit(limite)
        .all()
    )
    if not servicios:
        return "No hay servicios disponibles por el momento."
    return "\n".join(f"- {s.nombre} (${s.precio:,.2f})" for s in servicios)


def _primero(db, columna, orden):
    producto = (
        db.query(Producto)
        .filter(Producto.estado == True)
        .order_by(columna, orden)
        .first()
    )
    if not producto:
        return None
    return producto


def _producto_extremo(db, minimo=False):
    if minimo:
        producto = _primero(db, Producto.precio, Producto.precio.asc())
        verbo = "más barato"
    else:
        producto = _primero(db, Producto.precio, Producto.precio.desc())
        verbo = "más caro"
    if not producto:
        return "No hay productos disponibles por el momento."
    return f"El producto {verbo} es {producto.nombre} a ${producto.precio:,.2f} (stock {producto.stock})."


def _producto_stock(db, mas=True):
    if mas:
        producto = _primero(db, Producto.stock, Producto.stock.desc())
        verbo = "con más stock"
    else:
        producto = _primero(db, Producto.stock, Producto.stock.asc())
        verbo = "con menos stock"
    if not producto:
        return "No hay productos disponibles por el momento."
    return f"El producto {verbo} es {producto.nombre} con {producto.stock} unidades (${producto.precio:,.2f})."


def _mejor_servicio(db):
    servicios = (
        db.query(Servicio)
        .filter(Servicio.estado == True)
        .order_by(Servicio.nombre)
        .all()
    )
    if not servicios:
        return "No hay servicios disponibles por el momento."
    # Heurística: recomendamos Soporte técnico si existe; si no, el primero.
    recomendado = next((s for s in servicios if "soporte" in s.nombre.lower()), servicios[0])
    lista = "\n".join(f"- {s.nombre} (${s.precio:,.2f})" for s in servicios[:6])
    return (
        f"Para la mayoría de los casos te recomiendo **{recomendado.nombre}** "
        f"(${recomendado.precio:,.2f}). Estos son nuestros servicios:\n{lista}\n\n"
        "Cuéntame qué problema tienes y te oriento con el más adecuado."
    )


def _recomendar_servicio(db, texto):
    servicios = (
        db.query(Servicio)
        .filter(Servicio.estado == True)
        .order_by(Servicio.nombre)
        .all()
    )
    if not servicios:
        return "No hay servicios disponibles por el momento."

    def buscar(nombres):
        return next((s for s in servicios if any(n in s.nombre.lower() for n in nombres)), None)

    lento = ["lento", "lenta", "tarda", "no enciende", "no prende", "calienta", "ruido", "pantalla azul", "reinicia", "virus", "se apaga", "congela", "congelado"]
    instalar = ["instalar", "instalación", "instalacion", "programa", "office", "word", "excel", "antivirus", "juego", "software"]
    configurar = ["configurar", "configuración", "configuracion", "wifi", "internet", "correo", "impresora", "red", "cuenta"]
    asesoria = ["qué comprar", "que comprar", "comprar", "cuál me recomiendas", "cual me recomiendas", "presupuesto", "recomiendas", "elegir", "mejor equipo"]
    soporte = ["falla", "falla", "no funciona", "no sirve", "ayuda", "problema", "técnico", "tecnico", "asistencia"]

    if any(p in texto for p in lento):
        s = buscar(["mantenimiento"])
        if s:
            return (
                f"Por lo que describes, te recomiendo **{s.nombre}** (${s.precio:,.2f}). "
                "Un mantenimiento preventivo/correctivo ayuda con lentitud, sobrecalentamiento, "
                "ruidos y fallos como pantalla azul o reinicios."
            )
    if any(p in texto for p in instalar):
        s = buscar(["instalación", "instalacion"])
        if s:
            return (
                f"Para instalar programas o software te recomiendo **{s.nombre}** (${s.precio:,.2f}). "
                "Instalamos y configuramos las herramientas que necesites."
            )
    if any(p in texto for p in configurar):
        s = buscar(["configuración", "configuracion"])
        if s:
            return (
                f"Para problemas de red, wifi, correo o configuración te recomiendo **{s.nombre}** (${s.precio:,.2f})."
            )
    if any(p in texto for p in asesoria):
        s = buscar(["asesoría", "asesoria"])
        if s:
            return (
                f"Si necesitas ayuda para elegir, te recomiendo **{s.nombre}** (${s.precio:,.2f}). "
                "Te ayudamos a escoger el equipo o accesorio según tu necesidad y presupuesto."
            )
    if any(p in texto for p in soporte):
        s = buscar(["soporte"])
        if s:
            return (
                f"Para una falla o problema técnico te recomiendo **{s.nombre}** (${s.precio:,.2f}). "
                "Ofrecemos asistencia para solucionar problemas de software y configuración."
            )

    return (
        "Cuéntame un poco más el problema, por ejemplo: 'mi computador está lento', "
        "'no me deja instalar un programa', 'tengo problemas con el wifi', "
        "'no sé qué computador comprar' o 'mi equipo no funciona'. Con eso te recomiendo el servicio ideal.\n\n"
        + _linea_servicios(db)
    )


def respuesta_local(texto, db=None):
    texto = texto.lower()

    if any(p in texto for p in ("producto más caro", "producto mas caro", "más caro", "mas caro", "el más costoso", "el mas costoso", "el más caro")):
        return _producto_extremo(db, minimo=False) if db else "El producto más caro se consulta directamente en el catálogo."

    if any(p in texto for p in ("producto más barato", "producto mas barato", "más barato", "mas barato", "menos costoso", "más económico", "mas economico", "barato")):
        return _producto_extremo(db, minimo=True) if db else "El producto más barato se consulta directamente en el catálogo."

    if any(p in texto for p in ("producto con más stock", "producto con mas stock", "más stock", "mas stock", "mayor stock", "con más unidades", "con mas unidades")):
        return _producto_stock(db, mas=True) if db else "El producto con más stock se consulta directamente en el catálogo."

    if any(p in texto for p in ("producto con menos stock", "producto con menos unidades", "menos stock", "menor stock", "con menos unidades")):
        return _producto_stock(db, mas=False) if db else "El producto con menos stock se consulta directamente en el catálogo."

    if any(p in texto for p in ("mejor servicio", "el mejor servicio", "qué servicio me recomiendas", "que servicio me recomiendas", "cuál servicio", "cual servicio", "me recomiendas un servicio")):
        return _mejor_servicio(db) if db else "Los servicios se consultan directamente en la sección Servicios."

    if any(p in texto for p in ("qué productos", "que productos", "productos disponibles", "catalogo", "catálogo", "venden", "venden productos", "lista de productos")):
        return f"Estos son algunos de nuestros productos:\n{_linea_productos(db) if db else 'Consulta el catálogo en la sección Productos.'}"

    if any(p in texto for p in ("qué servicios", "que servicios", "servicios disponibles", "servicios ofrecen", "qué ofrece", "lista de servicios")):
        return f"Estos son algunos de nuestros servicios:\n{_linea_servicios(db) if db else 'Consulta la sección Servicios.'}"

    if any(p in texto for p in ("producto", "productos")):
        return f"En Pixel Store ofrecemos varios productos. Algunos de ellos:\n{_linea_productos(db) if db else 'Consulta la sección Productos.'}"

    if any(p in texto for p in ("servicio", "servicios")):
        return f"En Pixel Store ofrecemos varios servicios. Algunos de ellos:\n{_linea_servicios(db) if db else 'Consulta la sección Servicios.'}"

    if any(p in texto for p in ("precio", "cuánto cuesta", "cuanto cuesta", "valor")):
        return f"Estos son nuestros productos con precio:\n{_linea_productos(db) if db else 'Consulta la sección Productos.'}"

    # Recomendación según fallos/problemas descritos
    if any(p in texto for p in (
        "lento", "no enciende", "no prende", "calienta", "ruido", "pantalla azul",
        "virus", "instalar", "wifi", "internet", "configurar", "no funciona", "no sirve",
        "qué comprar", "que comprar", "comprar", "recomiendas", "falla", "ayuda", "problema", "técnico", "tecnico",
    )):
        return _recomendar_servicio(db, texto) if db else "Cuéntame el problema y te recomiendo un servicio."

    if "donde" in texto or "ubicación" in texto or "ubicacion" in texto or "dirección" in texto or "direccion" in texto:
        return "Nos encontramos en Medellín, Antioquia. Puedes ver la sección de contacto para más información."

    for clave, respuesta in FAQ.items():
        if clave in texto:
            return respuesta

    return "Puedo orientarte sobre productos (precio y stock), el más caro/barato, el de más/menos stock, servicios, recomendaciones según tu problema, pedidos, facturas, PQR, horarios y ubicación. ¿Qué necesitas?"


async def respuesta_proveedor(mensaje: str, historial: list[dict] | None = None) -> str | None:
    if not settings.AI_PROVIDER or settings.AI_PROVIDER.lower() == "local" or not settings.AI_API_KEY or not settings.AI_MODEL:
        return None

    proveedor = settings.AI_PROVIDER.lower()

    try:
        async with httpx.AsyncClient(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            if proveedor == "gemini":
                # Gemini: POST /v1beta/models/{modelo}:generateContent?key=API_KEY
                url = (
                    f"https://generativelanguage.googleapis.com/v1beta/models/"
                    f"{settings.AI_MODEL}:generateContent?key={settings.AI_API_KEY}"
                )
                contents = []
                for m in (historial or []):
                    rol = "model" if m.get("role") == "assistant" else "user"
                    contents.append({"role": rol, "parts": [{"text": m.get("content", "")}]})
                contents.append({"role": "user", "parts": [{"text": mensaje}]})
                payload = {"contents": contents}
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                candidatos = data.get("candidates") or []
                if not candidatos:
                    return None
                partes = candidatos[0].get("content", {}).get("parts") or []
                texto = "".join(p.get("text", "") for p in partes if isinstance(p, dict))
                return texto or None

            # OpenAI y compatibles: POST con Bearer y messages
            payload = {
                "model": settings.AI_MODEL,
                "messages": (historial or []) + [{"role": "user", "content": mensaje}],
            }
            headers = {"Authorization": f"Bearer {settings.AI_API_KEY}"}
            response = await client.post(settings.AI_PROVIDER, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("choices", [{}])[0].get("message", {}).get("content") or None
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError):
        return None
