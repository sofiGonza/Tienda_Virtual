# Pixel Store — Cuarto Avance (React + Vite + FastAPI + MySQL)

Aplicación web Full Stack tipo tienda de tecnología:

```
React + Vite  →  FastAPI (Python)  →  MySQL
   (frontend)         (backend)         (BD)
```

Cumple el **Cuarto Avance**: API REST completa, autenticación **JWT**, contraseñas con **hashing seguro (bcrypt/passlib)**, **control de roles** (administrador / empleado / cliente), **protección de endpoints**, operaciones **CRUD**, paneles diferenciados y conexión real Frontend ↔ Backend ↔ Base de Datos.

---

## 1. Requisitos

| Herramienta | Versión usada |
|---|---|
| Python | 3.12 |
| Node.js + npm | 20+ |
| MySQL | 8.x (local, puerto 3306) |
| FastAPI / Uvicorn | backend/requirements.txt |
| React + Vite | frontend/package.json |

---

## 2. Estructura del proyecto

```
Pixel_Store/
├── backend/
│   ├── app/
│   │   ├── main.py                 # App FastAPI + routers
│   │   ├── core/
│   │   │   ├── config.py           # Variables de entorno (.env)
│   │   │   ├── security.py         # Hash bcrypt + JWT
│   │   │   └── dependencies.py     # obtener_usuario_actual / verificar_roles
│   │   ├── database/
│   │   │   ├── database.py         # Conexión SQLAlchemy
│   │   │   └── init_db.py          # Crea tablas + roles/servicios/admin
│   │   ├── models/                 # ORM (usuario, rol, permiso, producto, servicio, pedido…)
│   │   ├── schemas/                # Validación Pydantic
│   │   └── routers/
│   │       ├── auth.py             # /api/auth (login, forgot/reset password)
│   │       ├── usuarios.py         # /api/usuarios (CRUD, rol, estado, password)
│   │       ├── productos.py        # /api/productos (CRUD)
│   │       ├── servicios.py        # /api/servicios (CRUD)
│   │       └── pedidos.py          # /api/pedidos
│   ├── database/
│   │   └── pixel_store.sql         # Script SQL de creación de la BD
│   ├── seed_productos.py           # Catálogo inicial (8 productos, idempotente)
│   ├── crear_admin.py              # (opcional) crea el usuario administrador
│   ├── requirements.txt
│   └── .env                        # Configuración local (NO publicar)
└── frontend/
    └── src/
        ├── components/             # Navbar, Login, RecuperarPassword, WhatsAppButton…
        ├── pages/                  # Productos, Panel, AdminProductos, AdminUsuarios,
        │                           # AdminPedidos, Pedido, Perfil…
        ├── Services/
        │   ├── api.js              # API_URL central = http://127.0.0.1:8000/api
        │   └── AuthService.js      # Sesión (access_token) + headers Bearer
        └── App.jsx                 # Rutas
```

---

## 3. Crear la base de datos

Con MySQL corriendo en el puerto 3306, ejecutar el script SQL:

mysql -u root -p < backend/database/pixel_store.sql

El script crea la BD `pixel_store` con las tablas `roles`, `permisos`, `usuarios`, `productos`, `servicios`, `pedidos` y `detalle_pedidos`, e inserta roles y servicios iniciales.

---

## 4. Ejecutar el Backend (FastAPI)

```bash
cd backend

# 1. Crear el entorno virtual (solo la primera vez)
python -m venv venv

# 2. Activar (Windows)
venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. (Opcional) Sembrar el catálogo de productos (idempotente)
python seed_productos.py

# 5. Ejecutar el servidor
uvicorn app.main:app --reload
```

El backend queda en:

- API: `http://127.0.0.1:8000`
- Documentación Swagger: **http://127.0.0.1:8000/docs**
- Health check: `http://127.0.0.1:8000/health`

> **Importante**: la versión de `bcrypt` debe ser **4.0.1** (compatible con `passlib`).
> bcrypt 5.x rompe el login con `Internal Server Error`. El `requirements.txt` ya la fija.

---

## 5. Sembrar datos iniciales (si hace falta)

```bash
cd backend
python seed_productos.py     # Inserta 8 productos si no existen (idempotente)
python crear_admin.py        # Crea el administrador si no existe
```

El arranque de `app.main` crea automáticamente roles, servicios, administrador y empleado si no existen (`app/database/init_db.py`).

---

## 6. Ejecutar el Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

El frontend queda en: **http://localhost:5173**



---

## 7. Credenciales de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@pixelstore.com` | `Admin123!` |
| Empleado | `empleado@pixelstore.com` | `Empleado123!` |
| Cliente | (el que se registre) | — |

El registro desde el frontend crea clientes automáticamente (`POST /api/usuarios/registro`).

---

## 8. Endpoints de la API

### Autenticación (`/api/auth`)
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/auth/login` | Login → JWT (`access_token`) | Público |
| POST | `/api/auth/forgot-password` | Genera código (se devuelve en la respuesta, práctica local) | Público |
| POST | `/api/auth/reset-password` | Cambia la contraseña con el código | Público |

### Usuarios (`/api/usuarios`)
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/usuarios/registro` | Público (crea cliente) |
| POST | `/api/usuarios` | Administrador |
| GET | `/api/usuarios` | Administrador |
| GET | `/api/usuarios/{id}` | Administrador / Empleado |
| PUT | `/api/usuarios/{id}` | Administrador |
| PUT | `/api/usuarios/{id}/rol` | Administrador |
| PATCH / PUT | `/api/usuarios/{id}/estado` | Administrador |
| PUT | `/api/usuarios/{id}/password` | Autenticado (propio) / Administrador |
| DELETE | `/api/usuarios/{id}` | Administrador (desactiva) |

### Productos (`/api/productos`)
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/productos` | Público |
| GET | `/api/productos/{id}` | Público |
| POST | `/api/productos` | Administrador / Empleado |
| PUT | `/api/productos/{id}` | Administrador / Empleado |
| DELETE | `/api/productos/{id}` | Administrador (desactiva) |

### Servicios (`/api/servicios`)
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/servicios` | Público |
| GET | `/api/servicios/{id}` | Público |
| POST | `/api/servicios` | Administrador / Empleado |
| PUT | `/api/servicios/{id}` | Administrador / Empleado |
| DELETE | `/api/servicios/{id}` | Administrador (desactiva) |

### Pedidos (`/api/pedidos`)
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/api/pedidos` | Autenticado (cliente) |
| GET | `/api/pedidos/mis-pedidos` | Autenticado (cliente) |
| GET | `/api/pedidos` | Administrador / Empleado |
| GET | `/api/pedidos/{id}` | Autenticado (propio) / Admin / Empleado |
| PUT | `/api/pedidos/{id}/estado` | Administrador / Empleado (body: `{"estado": "procesando"}`) |
| DELETE | `/api/pedidos/{id}` | Cliente (propio, solo pendiente) / Admin / Empleado |

**Errores**: todos los errores usan el estándar FastAPI `{"detail": "..."}`.
**Protección**: los endpoints protegidos devuelven **401** sin token y **403** con rol insuficiente.

---

## 9. Contrato Frontend ↔ Backend (campos)

El frontend ya está alineado con lo que devuelve FastAPI:

| Frontend usa | FastAPI devuelve |
|---|---|
| `producto.id` / `usuario.id` / `pedido.id` | `id` (entero) |
| `usuario.rol.nombre` | `rol: { id, nombre }` |
| `pedido.detalles[]` → nombre/cantidad/subtotal | `detalles[]` con `producto`, `cantidad`, `precio_unitario`, `subtotal` |
| `pedido.fecha` como fecha mostrada | `fecha` (datetime) |
| `datos.detail` en errores | `detail` |
| Token `Authorization: Bearer <token>` | `access_token` del login |

---

## 10. Notas de decisión

- **Páginas sin ruta** (`frontend/src/pages/Usuarios.jsx`, `ProductosAdmin.jsx`, `PedidosAdmin.jsx`): son versiones preliminares del tercer avance y **no** están enlazadas en `App.jsx`. Se conservan en el repositorio como evidencia, pero la aplicación usa las versiones definitivas: `AdminUsuarios.jsx`, `AdminProductos.jsx` y `AdminPedidos.jsx`.
- **Recuperación de contraseña**: el backend devuelve el código en la respuesta JSON (sin envío real de correo) para poder evidenciar el flujo en prácticas/avances.
- **Eliminación**: usuarios, productos y servicios usan **eliminación lógica** (`estado = false`) para conservar el historial.
- **`.env`**: contiene credenciales locales (BD, secreto JWT). No debe publicarse en repositorios remotos.

---

## 11. Evidencias para el avance

1. **Swagger**: abrir `http://127.0.0.1:8000/docs` y probar cada endpoint (GET/POST/PUT/PATCH/DELETE).
2. **Postman** (o curl): registrar usuario → login → copiar `access_token` → usarlo como `Authorization: Bearer <token>` en los endpoints protegidos.
3. **Endpoints protegidos**: intentar `GET /api/usuarios` sin token (401) y con token de cliente (403).
4. **Panel admin**: entrar con `admin@pixelstore.com` en `http://localhost:5173` → Panel → Usuarios / Productos / Pedidos.
5. **Panel empleado**: entrar con `empleado@pixelstore.com` → Panel → Productos (no puede eliminar) / Pedidos. No ve Usuarios.
6. **Panel cliente**: registrarse o entrar con un cliente → Navbar muestra "Pedidos" (Mis Pedidos) y el nombre del usuario.
7. **Capturas**: tomar pantallas de Swagger, Postman, paneles y Navbar como evidencia del cuarto avance.

---


## 13. Paneles por rol con menú lateral (rediseño)

Al iniciar sesión, cada usuario entra **directo a su panel** (`/panel`), que es una **ventana propia** con **menú lateral** (sin header, footer ni botón WhatsApp de la web). El Navbar muestra un **dropdown de usuario** (👤 Nombre → Mi Perfil / Mi Panel / Cerrar sesión).

### Estructura del panel (`frontend/src/pages/panel/`)
| Archivo | Rol | Función |
|---|---|---|
| `PanelLayout.jsx` | Todos | Layout con sidebar por rol y `<Outlet/>` |
| `PanelDashboard.jsx` | Todos | Redirige por rol al dashboard correcto |
| `DashboardAdmin.jsx` | Admin | Stats: agotados, más vendidos, usuarios, ventas día/semana/mes, pedidos por estado |
| `DashboardEmpleado.jsx` | Empleado | Ventas del día, meta mensual, comisiones, entregados, stock bajo |
| `DashboardCliente.jsx` | Cliente | Tiempo en la página, total pedidos, progreso por estado, rol y estado |
| `MisPedidos.jsx` | Cliente | Lista de pedidos + cancelar (si no está entregado/cancelado) |
| `DetallePedido.jsx` | Cliente | Detalle del pedido con productos, cantidades y subtotales |
| `Facturas.jsx` | Cliente | Facturas (pedidos) con estado y total, ver detalle |

### Menú lateral por rol
- **Administrador**: Dashboard, Productos, Pedidos, Usuarios, Ir a la página, Cerrar sesión. En Pedidos puede **agregar pedidos** (elige cliente + productos). En Usuarios gestiona todo (editar, eliminar, rol, estado).
- **Empleado**: Dashboard, Productos (agregar/editar, no eliminar), Pedidos (cambiar estado, **no cancelar**), Ir a la página, Cerrar sesión.
- **Cliente**: Dashboard, Mis Pedidos, Facturas, Ir a la página, Cerrar sesión. Puede **cancelar su pedido** mientras no esté entregado ni cancelado.

### Endpoints nuevos de estadísticas (`/api/estadisticas`)
| Endpoint | Acceso | Devuelve |
|---|---|---|
| `GET /api/estadisticas/admin` | Administrador | Productos agotados, más vendidos, total usuarios, ventas día/semana/mes, pedidos por estado |
| `GET /api/estadisticas/empleado` | Empleado | Ventas del día y semana, meta mensual (10M), comisiones (5%), entregados, stock bajo |
| `GET /api/estadisticas/cliente` | Cliente (autenticado) | Total pedidos, pedidos por estado, rol y estado |

### Otros cambios
- **Filtro por categoría** en la tienda (`/productos`): botones de categorías derivadas de los productos; también soporta `GET /api/productos?categoria=X`.
- **Pedidos como admin**: `POST /api/pedidos?usuario_id=N` (solo administrador) crea el pedido a nombre del cliente indicado.
- **Cancelación de cliente**: `PUT /api/pedidos/{id}/estado` con `{"estado":"cancelado"}` permite al cliente dueño cancelar su pedido si no está entregado/cancelado (devuelve stock).
- **Detalles enriquecidos**: las respuestas de pedidos incluyen `detalles[].nombre` y `detalles[].precio` del producto.

> ⚠️ **Puerto del backend**: si el puerto 8000 queda ocupado por un proceso huérfano (síntoma: responde código viejo y no se puede matar con taskkill), reiniciar el equipo libera el puerto. El frontend apunta a `http://127.0.0.1:8002/api` en `frontend/src/Services/api.js` (ajustable). En un arranque limpio se usa `uvicorn app.main:app --reload` en el puerto que quede libre y se actualiza `api.js`.

## Quinto avance

Aplicar primero `backend/database/pixel_store.sql` en una instalación nueva. Para una base existente, ejecutar `backend/database/migrations/005_quinto_avance.sql` en un cliente MySQL, después de respaldar la base. La migración no contiene `DROP TABLE`.

### Nuevos módulos

La API incorpora `/api/ventas`, `/api/facturas`, `/api/reportes`, `/api/pqr`, `/api/chatbot` y métricas comerciales en `/api/estadisticas/comercial`. El frontend conserva `VITE_API_URL` y el token Bearer de la sesión.

### Despliegue

Backend: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` o el `Procfile`. Frontend: `npm run build` y publicar `dist/` en un hosting estático. Configurar `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_URL`, variables SMTP y, si se habilita un proveedor, variables `AI_*`. No subir `.env` ni declarar URL pública hasta probar `/health` y CORS en la plataforma elegida.

## Matriz del quinto avance

La trazabilidad REQ-01..REQ-25 está disponible en [docs/matriz-requisitos-q5.md](docs/matriz-requisitos-q5.md). La matriz diferencia lo probado localmente de lo que requiere despliegue, SMTP o un proveedor de IA externo.
