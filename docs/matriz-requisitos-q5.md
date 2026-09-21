# Matriz de requisitos — Quinto avance Pixel Store

| ID | Requisito | Implementación | Endpoint/pantalla | Evidencia esperada | Estado |
|---|---|---|---|---|---|
| REQ-01 | Módulo de ventas | Modelo `Venta`, detalle y cálculo transaccional | `POST /api/ventas`, Panel/Ventas | Registro persistido y respuesta total | probado localmente |
| REQ-02 | Productos y servicios vendidos | `DetalleVenta` con producto/servicio, cantidad y precio | `POST /api/ventas` | Venta con líneas | probado localmente |
| REQ-03 | Historial de ventas | Consulta protegida con filtros | `GET /api/ventas`, Panel/HistorialVentas | Lista filtrada | probado localmente |
| REQ-04 | Reporte diario | Consulta por fecha/rango | `/api/reportes/ventas-diarias/*` | Reporte del día | implementado |
| REQ-05 | Reporte PDF | ReportLab y `BytesIO` | `GET /api/reportes/ventas-diarias/pdf` | Archivo `%PDF` | probado localmente |
| REQ-06 | Reporte Excel | OpenPyXL y `BytesIO` | `GET /api/reportes/ventas-diarias/excel` | Archivo `PK` | probado localmente |
| REQ-07 | Facturas de venta | Factura vinculada a venta | `POST /api/facturas/venta/{venta_id}` | Factura con totales | implementado |
| REQ-08 | Consulta de facturas | Lista por cliente/número | `GET /api/facturas`, Panel/Facturas | Consulta autorizada | probado localmente |
| REQ-09 | Descarga de facturas | Generador ReportLab | `GET /api/facturas/{id}/pdf` | PDF con MIME correcto | implementado |
| REQ-10 | Dashboard administrativo | Dashboard existente por rol y estadísticas | `/panel`, DashboardAdmin | Captura de Cards | implementado |
| REQ-11 | Dashboard de ventas | Barras y gráfica lineal | DashboardAdmin/Empleado | Capturas de gráficos | implementado |
| REQ-12 | Dashboards por roles | Dependencias JWT/rol y sidebar | `/panel` | Capturas por rol | probado localmente |
| REQ-13 | Filtros dashboard | Filtros comerciales SQLAlchemy | `/api/estadisticas/comercial` | Respuestas filtradas | implementado |
| REQ-14 | Nuevos endpoints FastAPI | Routers ventas, facturas, reportes, PQR, chatbot | OpenAPI | Rutas listadas | probado localmente |
| REQ-15 | Dashboard integrado FastAPI | Fetch de estadísticas desde React | Dashboard por rol | Network/API y captura | implementado |
| REQ-16 | Módulo PQR | Modelo, endpoints y pantalla PQR | `/api/pqr`, Panel/PQR | Registro y estado | probado localmente |
| REQ-17 | Chatbot atención | Widget React y FAQ | Chatbot público | Conversación visible | implementado |
| REQ-18 | IA del chatbot | Proveedor opcional vía `httpx` | `POST /api/chatbot/mensaje` | Prueba con proveedor | pendiente externo |
| REQ-19 | API Key segura | Variables `AI_*`, `.env` ignorado | `backend/.env.example` | Captura sin secreto | probado localmente |
| REQ-20 | Despliegue | `Procfile`, health check y guía | `backend/Procfile`, README | URL pública y captura | pendiente externo |
| REQ-21 | Evolución BD SQL | SQL y migración idempotente | `database/pixel_store.sql` | Tablas/relaciones | implementado |
| REQ-22 | Modelos y schemas | SQLAlchemy + Pydantic | `backend/app/models`, `schemas` | OpenAPI y código | probado localmente |
| REQ-23 | Componentes React | Servicios, paneles y componentes nuevos | `frontend/src` | Navegación/capturas | implementado |
| REQ-24 | Seguridad integral | JWT, roles, hashing y `.env` | Dependencias y routers | 401/403 y revisión | probado localmente |
| REQ-25 | Pruebas Postman | Secuencia documentada | `docs/postman-quinto-avance.md` | Colección/capturas | implementado |

Los estados externos no se marcan como verificados sin una plataforma, credenciales o proveedor real.
