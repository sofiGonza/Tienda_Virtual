# Postman — Quinto avance Pixel Store

## Variables
- `base_url`: `http://127.0.0.1:8000/api`
- `token`: JWT obtenido en login
- `venta_id`, `factura_id`, `conversacion_id`

## Headers
En rutas protegidas usar `Authorization: Bearer {{token}}` y `Content-Type: application/json`.

## Secuencia principal
1. `POST {{base_url}}/auth/login` con `{"correo":"admin@pixelstore.com","password":"Admin123!"}`. Esperado: `200` y `access_token`.
2. `POST {{base_url}}/ventas` con `{"items":[{"producto_id":1,"cantidad":1}]}`. Esperado: `201`, subtotal, impuestos, total y estado.
3. `GET {{base_url}}/ventas` y `GET {{base_url}}/ventas/{{venta_id}}`. Esperado: `200` y detalle de líneas.
4. `POST {{base_url}}/facturas/venta/{{venta_id}}`. Esperado: `201` con número único.
5. `GET {{base_url}}/facturas/{{factura_id}}/pdf`. Esperado: `200`, `application/pdf`, `filename="*.pdf"`, bytes `%PDF`.
6. `GET {{base_url}}/reportes/ventas-diarias/pdf?fecha=2026-09-19`. Esperado: `200`, `application/pdf`, `.pdf`.
7. `GET {{base_url}}/reportes/ventas-diarias/excel?fecha=2026-09-19`. Esperado: `200`, MIME XLSX, `.xlsx`, bytes `PK`.
8. `POST {{base_url}}/pqr` con `{"asunto":"Consulta","tipo":"peticion","descripcion":"Necesito información sobre mi pedido"}`. Esperado: `201`.
9. `GET {{base_url}}/pqr`. Esperado: `200` y solo PQR autorizadas.
10. `POST {{base_url}}/chatbot/mensaje` con `{"mensaje":"¿Cuáles son sus horarios?"}`. Esperado: `200` con respuesta local o IA, sin exponer secretos.

## Casos de autorización
- Sin Bearer en ventas, facturas, reportes, PQR o chatbot: `401`.
- Cliente consultando venta/factura/PQR de otro cliente: `403`.
- ID inexistente de venta/factura/PQR: `404`.
- Cliente intentando gestionar estados administrativos de PQR: `403`.
