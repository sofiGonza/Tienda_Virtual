# Despliegue de Pixel Store — Backend en Render + Frontend en Vercel

> **Contexto:** el backend de Railway devolvía `429 Too Many Requests` desde la
> edge de la plataforma (bloqueo a nivel de cuota/infraestructura, no de código).
> Esta guía documenta el despliegue alternativo usando Render (backend) y Vercel
> (frontend), las mismas plataformas ya usadas en otros proyectos del usuario.

---

## 1. Backend en Render

### Opción A — Blueprint automático (recomendado)

El repositorio ya incluye `render.yaml` en la raíz.

1. Ve a [render.com](https://render.com) → **New → Blueprint**.
2. Conecta el repositorio `sofiGonza/Tienda_Virtual`.
3. Render detecta `render.yaml` y crea el servicio `pixel-store-api`
   (runtime Python, root dir `backend`, comando `uvicorn app.main:app`).
4. En el dashboard del servicio, **Settings → Environment**, define:

   | Variable            | Valor |
   |---------------------|-------|
   | `DATABASE_URL`      | URL de MySQL (Railway u otro host). Ej: `mysql+pymysql://user:pass@host:3306/pixel_store` |
   | `SECRET_KEY`        | Texto largo aleatorio |
   | `FRONTEND_URL`      | `https://pixel-store-frontend.vercel.app` (la URL que te dé Vercel) |
   | `SMTP_*` (opcional) | Los de tu correo, si quieres recuperación de contraseña real |

   Render te pedirá "confirm" al añadir las que tienen `sync: false`.
5. **Deploy** → espera a que el health check pase.
6. Verifica: abre `https://pixel-store-api.onrender.com/health`
   → debe responder `{"status":"ok"}` con `200`.

### Opción B — Manual

1. **New → Web Service** → selecciona el repo.
2. Configuración:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/health`
3. Añade las mismas variables de entorno del paso 4 de la Opción A.
4. Deploy y verifica `/health`.

---

## 2. Frontend en Vercel

1. Ve a [vercel.com](https://vercel.com) → **New Project** → importa el repo.
2. **Root Directory:** `frontend`
3. Framework preset: **Vite** (Vercel lo detecta solo; además hay `vercel.json`
   con build y rewrites de SPA ya preparado).
4. En **Environment Variables**, añade:

   ```
   VITE_API_URL=https://pixel-store-api.onrender.com/api
   ```

   (ajusta si Render te dio otra URL; debe terminar en `/api`).
5. **Deploy.** Vercel ejecuta `npm run build` (usa `base: "/"`, ya configurado
   en `vite.config.js`).
6. Verifica: abre tu dominio `https://pixel-store-frontend.vercel.app/productos`
   → debe cargar los productos desde la API de Render.

> Si prefieres probar en local con el backend de producción:
> `VITE_API_URL=https://pixel-store-api.onrender.com/api npm run dev`
> (o copia `frontend/.env.production.example` → `frontend/.env.production`
> y ajusta el valor).

---

## 3. Base de datos

El backend usa MySQL vía `DATABASE_URL`.

- **Si Railway sigue funcionando para la BD:** usa la URL interna del MySQL de
  Railway (`mysql+pymysql://...`) como valor de `DATABASE_URL` en Render.
  Railway no bloquea el tráfico de BD de la misma forma que el dominio público,
  pero **si la cuenta está en cuota agotada, el MySQL tampoco será accesible**.
- **Alternativa gratuita:** [Aiven](https://aiven.io), [Railway](https://railway.app)
  (otra cuenta/plan), o un MySQL de un host gratuito. El código crea tablas y
  siembra datos al arrancar (`create_all` + `crear_tablas()` + `sembrar_datos()`),
  así que una BD vacía basta.

---

## 4. Comprobación final end-to-end

```bash
# 1) API viva
curl https://pixel-store-api.onrender.com/health
# -> {"status":"ok"}

# 2) CORS del backend acepta el frontend de Vercel
curl -i -X OPTIONS https://pixel-store-api.onrender.com/api/productos \
  -H "Origin: https://pixel-store-frontend.vercel.app" \
  -H "Access-Control-Request-Method: GET" | grep -i access-control
# -> access-control-allow-origin: https://pixel-store-frontend.vercel.app

# 3) Productos reales
curl https://pixel-store-api.onrender.com/api/productos
# -> [{...}, ...]

# 4) Frontend servido
curl -s https://pixel-store-frontend.vercel.app/productos | grep -i "<title>"
```

---

## 5. Notas

- El CORS del backend ya acepta `*.vercel.app`, `*.onrender.com` y
  `*.up.railway.app` (regex en `backend/app/main.py`), así que no tendrás que
  tocarlo al cambiar de dominio.
- El arranque del backend es resiliente: si la BD tarda, reintenta en segundo
  plano y `/health` responde igualmente `200`.
- `frontend/.env` local sigue apuntando a `http://127.0.0.1:8000/api` para
  desarrollo; en Vercel se usa la variable de entorno del dashboard.
