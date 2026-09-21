# Validación del entorno — Quinto avance

Fecha de validación: 2026-09-19

| Comando/validación | Resultado real | Observaciones |
|---|---|---|
| `backend/venv/Scripts/python.exe -c "import reportlab, openpyxl, httpx"` | Exitoso | Dependencias instaladas y disponibles en el entorno virtual. |
| `python -m compileall app` | Exitoso | Backend compilado sin errores. |
| Importación `app.main` | Exitoso | FastAPI arranca y registra los modelos nuevos. |
| `app.openapi()['paths']` | Exitoso | 34 rutas; incluye ventas, facturas, reportes, PQR y chatbot. |
| `pytest -q` | Exitoso: 8 passed | 1 warning de compatibilidad `TestClient`/`httpx` de Starlette. |
| Prefijo PDF | Exitoso: `%PDF` | Reportes y generador de factura producen PDF ReportLab real. |
| Prefijo XLSX | Exitoso: `PK` | Reporte OpenPyXL produce archivo XLSX real. |
| `npm run lint` | Exitoso | 0 errores; 10 warnings no bloqueantes preexistentes o de estilo/hooks. |
| `npm run build` | Exitoso | Vite generó `frontend/dist`. |
| Conexión MySQL `SELECT 1` | Exitoso | La conexión configurada respondió correctamente. No se ejecutaron operaciones destructivas. |

## Pendientes externos

- La URL pública y el despliegue en Railway/u otra plataforma no se verificaron en este entorno.
- SMTP real no se probó mediante envío de correo.
- La IA externa no se probó con una API Key real; el fallback local sí está cubierto.
- Las pruebas Postman requieren ejecutarse con credenciales de usuario y datos de demostración.

## Nota de seguridad

No se incluyeron secretos en la documentación. `backend/.env` permanece excluido mediante `.gitignore`.
