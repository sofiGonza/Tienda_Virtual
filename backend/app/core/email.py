from email.message import EmailMessage
from smtplib import SMTP
from smtplib import SMTPException

from app.core.config import settings


class EmailDeliveryError(Exception):
    """Indica que no se pudo entregar un correo."""


def enviar_codigo_recuperacion(
    destinatario: str,
    codigo: str
) -> None:
    """Envía el código de recuperación mediante el SMTP configurado."""
    configuracion_incompleta = not all(
        (
            settings.SMTP_HOST,
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
            settings.SMTP_FROM_EMAIL,
        )
    )

    if configuracion_incompleta:
        raise EmailDeliveryError(
            "El servicio de correo no está configurado."
        )

    mensaje = EmailMessage()
    mensaje["Subject"] = "Tu código de recuperación | Pixel Store"
    mensaje["From"] = (
        f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    )
    mensaje["To"] = destinatario
    mensaje.set_content(
        "Hola,\n\n"
        "Recibimos una solicitud para recuperar la contraseña de tu cuenta "
        "de Pixel Store.\n\n"
        f"Tu código de recuperación es: {codigo}\n\n"
        "Este código es válido durante 15 minutos. No lo compartas con nadie.\n\n"
        "Si no solicitaste este cambio, puedes ignorar este mensaje. Tu cuenta "
        "seguirá protegida.\n\n"
        "Saludos,\n"
        "El equipo de Pixel Store"
    )
    mensaje.add_alternative(
        f"""
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Código de recuperación | Pixel Store</title>
          </head>
          <body style="margin:0; padding:32px 16px; background:#f1f5f9; font-family:Arial,Helvetica,sans-serif; color:#1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; margin:0 auto;">
              <tr>
                <td style="padding:0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f172a; border-radius:20px 20px 0 0;">
                    <tr>
                      <td style="padding:28px 32px;">
                        <div style="font-size:24px; font-weight:800; letter-spacing:.5px; color:#22d3ee;">Pixel Store</div>
                        <div style="margin-top:6px; font-size:13px; color:#cbd5e1;">Tecnología que conecta contigo</div>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:0 0 20px 20px;">
                    <tr>
                      <td style="padding:36px 32px;">
                        <div style="display:inline-block; padding:7px 12px; border-radius:999px; background:#cffafe; color:#0e7490; font-size:12px; font-weight:700; letter-spacing:.4px;">SEGURIDAD DE TU CUENTA</div>
                        <h1 style="margin:20px 0 12px; font-size:26px; line-height:1.25; color:#0f172a;">Recupera tu acceso</h1>
                        <p style="margin:0 0 18px; font-size:16px; line-height:1.7; color:#475569;">Recibimos una solicitud para recuperar la contraseña de tu cuenta de Pixel Store.</p>
                        <p style="margin:0 0 10px; font-size:14px; font-weight:700; color:#334155;">Tu código de recuperación es:</p>

                        <div style="margin:0 0 24px; padding:22px 16px; border:1px solid #a5f3fc; border-radius:14px; background:#ecfeff; text-align:center;">
                          <div style="font-size:36px; line-height:1; font-weight:800; letter-spacing:9px; color:#0e7490;">{codigo}</div>
                        </div>

                        <p style="margin:0 0 8px; font-size:14px; line-height:1.6; color:#475569;"><strong>Este código vence en 15 minutos.</strong></p>
                        <p style="margin:0 0 22px; font-size:14px; line-height:1.6; color:#64748b;">Por seguridad, no compartas este código. Pixel Store nunca te pedirá tu contraseña por correo.</p>
                        <div style="padding:14px 16px; border-left:4px solid #22d3ee; background:#f8fafc; font-size:13px; line-height:1.6; color:#64748b;">Si no solicitaste este cambio, ignora este mensaje. Tu cuenta seguirá protegida.</div>
                        <p style="margin:28px 0 0; font-size:14px; line-height:1.6; color:#475569;">Saludos,<br><strong style="color:#0f172a;">El equipo de Pixel Store</strong></p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:18px 0 0; text-align:center; font-size:12px; line-height:1.5; color:#64748b;">Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """,
        subtype="html"
    )

    try:
        with SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as servidor:
            servidor.ehlo()
            if settings.SMTP_USE_TLS:
                servidor.starttls()
                servidor.ehlo()
            servidor.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            servidor.send_message(mensaje)
    except (OSError, SMTPException) as error:
        raise EmailDeliveryError(
            "No se pudo enviar el correo de recuperación."
        ) from error


def enviar_pqr_respondida(
    destinatario: str,
    asunto_pqr: str,
    enlace: str,
) -> None:
    """Envía al cliente un correo indicando que su PQR fue respondida."""
    configuracion_incompleta = not all(
        (
            settings.SMTP_HOST,
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
            settings.SMTP_FROM_EMAIL,
        )
    )

    if configuracion_incompleta:
        raise EmailDeliveryError(
            "El servicio de correo no está configurado."
        )

    mensaje = EmailMessage()
    mensaje["Subject"] = "Tu PQR fue respondida | Pixel Store"
    mensaje["From"] = (
        f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    )
    mensaje["To"] = destinatario
    mensaje.set_content(
        "Hola,\n\n"
        f"Tu solicitud PQR '{asunto_pqr}' ha sido respondida por nuestro equipo.\n\n"
        "Ingresa al panel para ver la respuesta:\n"
        f"{enlace}\n\n"
        "Gracias por escribirnos.\n"
        "El equipo de Pixel Store"
    )
    mensaje.add_alternative(
        f"""
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tu PQR fue respondida | Pixel Store</title>
          </head>
          <body style="margin:0; padding:32px 16px; background:#f1f5f9; font-family:Arial,Helvetica,sans-serif; color:#1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; margin:0 auto;">
              <tr>
                <td style="padding:0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f172a; border-radius:20px 20px 0 0;">
                    <tr>
                      <td style="padding:28px 32px;">
                        <div style="font-size:24px; font-weight:800; letter-spacing:.5px; color:#22d3ee;">Pixel Store</div>
                        <div style="margin-top:6px; font-size:13px; color:#cbd5e1;">Tecnología que conecta contigo</div>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:0 0 20px 20px;">
                    <tr>
                      <td style="padding:36px 32px;">
                        <div style="display:inline-block; padding:7px 12px; border-radius:999px; background:#dcfce7; color:#15803d; font-size:12px; font-weight:700; letter-spacing:.4px;">PQR RESPONDIDA</div>
                        <h1 style="margin:20px 0 12px; font-size:26px; line-height:1.25; color:#0f172a;">Tu solicitud fue respondida</h1>
                        <p style="margin:0 0 18px; font-size:16px; line-height:1.7; color:#475569;">Hola, tu solicitud <strong>{asunto_pqr}</strong> ya tiene respuesta de nuestro equipo.</p>
                        <p style="margin:0 0 24px; font-size:15px; line-height:1.7; color:#475569;">Ingresa a tu panel para ver el detalle y confirmar si quedó resuelta.</p>

                        <div style="margin:0 0 24px; text-align:center;">
                          <a href="{enlace}" style="display:inline-block; padding:14px 28px; border-radius:14px; background:#22d3ee; color:#0f172a; font-size:15px; font-weight:700; text-decoration:none;">Ver mi PQR</a>
                        </div>

                        <p style="margin:0; font-size:14px; line-height:1.6; color:#475569;">Saludos,<br><strong style="color:#0f172a;">El equipo de Pixel Store</strong></p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:18px 0 0; text-align:center; font-size:12px; line-height:1.5; color:#64748b;">Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """,
        subtype="html"
    )

    try:
        with SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as servidor:
            servidor.ehlo()
            if settings.SMTP_USE_TLS:
                servidor.starttls()
                servidor.ehlo()
            servidor.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            servidor.send_message(mensaje)
    except (OSError, SMTPException) as error:
        raise EmailDeliveryError(
            "No se pudo enviar el correo de PQR respondida."
        ) from error


def _imagen_articulo(imagen: str | None, base_url: str) -> str:
    """Devuelve una URL de imagen usable dentro del correo."""
    if imagen and imagen.strip():
        return imagen.strip()
    # Fallback: logo de la tienda (está en /static del backend).
    base = (base_url or "").rstrip("/")
    if base:
        return f"{base}/static/logoPixel.png"
    return "https://tienda-virtual-mocha.vercel.app/favicon.png"


def enviar_actualizacion_pedido(
    destinatario: str,
    nombre_cliente: str,
    numero_pedido: int,
    estado: str,
    detalles: list[dict],
    total: float,
    base_url: str = "",
) -> None:
    """Envía al cliente un correo estilo Temu al cambiar el estado de su pedido.

    ``detalles`` es una lista de dicts con: nombre, imagen, cantidad,
    precio_unitario, subtotal (los artículos pueden ser productos o servicios).
    """
    configuracion_incompleta = not all(
        (
            settings.SMTP_HOST,
            settings.SMTP_USERNAME,
            settings.SMTP_PASSWORD,
            settings.SMTP_FROM_EMAIL,
        )
    )

    if configuracion_incompleta:
        raise EmailDeliveryError(
            "El servicio de correo no está configurado."
        )

    ETIQUETAS_ESTADO = {
        "pendiente": ("PENDIENTE", "#f59e0b", "#fffbeb"),
        "procesando": ("PROCESANDO", "#3b82f6", "#eff6ff"),
        "enviado": ("ENVIADO", "#0ea5e9", "#e0f2fe"),
        "entregado": ("ENTREGADO", "#10b981", "#ecfdf5"),
        "realizado": ("REALIZADO", "#10b981", "#ecfdf5"),
        "cancelado": ("CANCELADO", "#ef4444", "#fef2f2"),
    }
    etiqueta, color, fondo = ETIQUETAS_ESTADO.get(
        estado, (estado.upper(), "#64748b", "#f1f5f9")
    )

    filas = []
    for d in detalles:
        nombre = d.get("nombre") or "Artículo"
        imagen = _imagen_articulo(d.get("imagen"), base_url)
        cantidad = d.get("cantidad") or 1
        precio = float(d.get("precio_unitario") or 0)
        subtotal = float(d.get("subtotal") or (precio * cantidad))
        filas.append(
            f"""
            <tr>
              <td style="padding:16px; border-bottom:1px solid #e2e8f0; vertical-align:middle;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="72" style="vertical-align:middle;">
                      <img src="{imagen}" alt="{nombre}" width="64" height="64"
                           style="width:64px; height:64px; object-fit:cover; border-radius:12px; border:1px solid #e2e8f0; display:block;" />
                    </td>
                    <td style="vertical-align:middle; padding:0 12px;">
                      <div style="font-size:15px; font-weight:700; color:#0f172a; line-height:1.35;">{nombre}</div>
                      <div style="margin-top:4px; font-size:13px; color:#64748b;">Cantidad: {cantidad}</div>
                    </td>
                    <td style="vertical-align:middle; text-align:right; white-space:nowrap;">
                      <div style="font-size:15px; font-weight:800; color:#0f172a;">${subtotal:,.2f}</div>
                      <div style="margin-top:2px; font-size:12px; color:#94a3b8;">${precio:,.2f} c/u</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            """
        )
    filas_html = "".join(filas) if filas else (
        "<tr><td style='padding:16px; color:#64748b; font-size:14px;'>"
        "No pudimos cargar los artículos de este pedido.</td></tr>"
    )

    mensaje = EmailMessage()
    mensaje["Subject"] = f"Tu pedido #{numero_pedido} fue actualizado | Pixel Store"
    mensaje["From"] = (
        f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    )
    mensaje["To"] = destinatario
    mensaje.set_content(
        f"Hola {nombre_cliente},\n\n"
        f"Tu pedido #{numero_pedido} ha sido actualizado.\n"
        f"Nuevo estado: {estado.upper()}\n\n"
        "Detalle de tus artículos:\n"
        + "".join(
            f"- {d.get('nombre') or 'Artículo'} x{d.get('cantidad') or 1}: "
            f"${float(d.get('subtotal') or 0):,.2f}\n"
            for d in detalles
        )
        + f"\nTotal: ${total:,.2f}\n\n"
        "Gracias por comprar con nosotros.\n"
        "El equipo de Pixel Store"
    )
    mensaje.add_alternative(
        f"""
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tu pedido #{numero_pedido} fue actualizado | Pixel Store</title>
          </head>
          <body style="margin:0; padding:32px 16px; background:#f1f5f9; font-family:Arial,Helvetica,sans-serif; color:#1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; margin:0 auto;">
              <tr>
                <td style="padding:0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f172a; border-radius:20px 20px 0 0;">
                    <tr>
                      <td style="padding:28px 32px;">
                        <div style="font-size:24px; font-weight:800; letter-spacing:.5px; color:#22d3ee;">Pixel Store</div>
                        <div style="margin-top:6px; font-size:13px; color:#cbd5e1;">Tecnología que conecta contigo</div>
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff; border-radius:0 0 20px 20px;">
                    <tr>
                      <td style="padding:36px 32px;">
                        <div style="display:inline-block; padding:7px 14px; border-radius:999px; background:{fondo}; color:{color}; font-size:12px; font-weight:800; letter-spacing:.6px;">{etiqueta}</div>
                        <h1 style="margin:20px 0 10px; font-size:26px; line-height:1.25; color:#0f172a;">Hola {nombre_cliente}, tu pedido fue actualizado</h1>
                        <p style="margin:0 0 6px; font-size:15px; line-height:1.6; color:#475569;">
                          Tu pedido <strong style="color:#0f172a;">#{numero_pedido}</strong> cambió de estado.
                        </p>
                        <p style="margin:0 0 24px; font-size:15px; line-height:1.6; color:#475569;">
                          El estado actual es <strong style="color:{color};">{etiqueta}</strong>.
                        </p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0; border-radius:16px; overflow:hidden;">
                          {filas_html}
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;">
                          <tr>
                            <td style="text-align:right; font-size:15px; font-weight:800; color:#0f172a;">
                              Total del pedido: <span style="font-size:20px;">${total:,.2f}</span>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:28px 0 0; font-size:14px; line-height:1.6; color:#475569;">
                          Gracias por comprar con nosotros.<br>
                          <strong style="color:#0f172a;">El equipo de Pixel Store</strong>
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:18px 0 0; text-align:center; font-size:12px; line-height:1.5; color:#64748b;">Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """,
        subtype="html"
    )

    try:
        with SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as servidor:
            servidor.ehlo()
            if settings.SMTP_USE_TLS:
                servidor.starttls()
                servidor.ehlo()
            servidor.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            servidor.send_message(mensaje)
    except (OSError, SMTPException) as error:
        raise EmailDeliveryError(
            "No se pudo enviar el correo de actualización del pedido."
        ) from error
