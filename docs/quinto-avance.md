# Pixel Store — contratos y avance quinto

## Contratos preservados
- FastAPI conserva `/api/auth`, `/api/usuarios`, `/api/productos`, `/api/servicios`, `/api/pedidos` y `/api/estadisticas`.
- Frontend conserva sesión `obtenerSesion()` con token Bearer y `VITE_API_URL` mediante `frontend/src/Services/api.js`.
- Se conserva recuperación de contraseña SMTP y el panel por roles.

## Nuevos módulos
- SQL: ventas, detalle_ventas, facturas, detalle_facturas, pqr, conversaciones y mensajes.
- API: ventas, facturas, reportes, PQR, chatbot y estadísticas comerciales.
- React: registro/historial de ventas, facturas reales, PQR, chatbot y gráfica lineal.

## Estado de verificación
La publicación externa, credenciales SMTP/IA y URL pública requieren configuración fuera del repositorio. No se declaran como verificadas.

## Matriz de requisitos

Consulta la matriz verificable en [docs/matriz-requisitos-q5.md](matriz-requisitos-q5.md). Los requisitos de despliegue, URL pública, SMTP real e IA externa se mantienen como pendientes externos hasta contar con una prueba efectiva.
