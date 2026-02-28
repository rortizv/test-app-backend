# Guía de despliegue

Esta guía cubre cómo desplegar el **backend** (NestJS) y el **frontend** (Angular con SSR).

---

## Requisitos previos

- **Backend**: Base de datos PostgreSQL (local, Cloud SQL, Neon, Supabase, etc.).
- **Frontend**: URL base del API del backend (para `environment.prod.ts`).

---

## 1. Desplegar el backend

### Variables de entorno

Crea un archivo `.env` (o configúralas en tu plataforma) con:

```env
PORT=8080
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

### Opción A: Docker (local o cualquier cloud)

Desde la carpeta del backend:

```bash
cd test-app-backend
docker build -t test-app-backend .
docker run -p 8080:8080 -e DATABASE_URL="postgresql://..." test-app-backend
```

### Opción B: Google Cloud Run

1. Activa la API de Cloud Run y (si usas Cloud SQL) la de SQL Admin.
2. Conecta el repo o sube la imagen:

```bash
cd test-app-backend
gcloud run deploy test-app-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=postgresql://..."
```

Si usas **Cloud SQL**, añade `--add-cloudsql-instances=PROJECT:REGION:INSTANCE` y en `DATABASE_URL` el socket:  
`postgresql://USER:PASSWORD@/DB_NAME?host=/cloudsql/PROJECT:REGION:INSTANCE`.

### Opción C: Railway / Render / Fly.io

- **Railway**: Conecta el repo, raíz del proyecto = `test-app-backend`, añade variable `DATABASE_URL` y (opcional) un servicio PostgreSQL.
- **Render**: New → Web Service, raíz = `test-app-backend`, comando `npm run start:prod`, variable `DATABASE_URL`.
- **Fly.io**: `fly launch` en la carpeta del backend, luego `fly secrets set DATABASE_URL=...`.

### Migraciones

En producción, ejecuta las migraciones antes (o al arrancar) contra la misma `DATABASE_URL`:

```bash
npm run migration:run
```

(Ajusta el comando si tu script usa otra configuración.)

---

## 2. Desplegar el frontend

### Configurar la URL del API

En **test-app-frontend** edita `src/environments/environment.prod.ts` y pon la URL real del backend:

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://tu-backend.example.com',  // Sin barra final
};
```

### Opción A: Docker

Desde la carpeta del frontend:

```bash
cd test-app-frontend
docker build -t test-app-frontend .
docker run -p 4000:4000 test-app-frontend
```

El frontend quedará en `http://localhost:4000`. Puedes cambiar el puerto con `-e PORT=8080` (y el `EXPOSE` en el Dockerfile si quieres).

### Opción B: Google Cloud Run

```bash
cd test-app-frontend
gcloud run deploy test-app-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 4000
```

No hace falta `DATABASE_URL` en el frontend; solo que `apiBaseUrl` en prod apunte al backend.

### Opción C: Vercel (solo build estático, sin SSR)

Si en el futuro quitas SSR y sirves solo estático, puedes usar Vercel/Netlify con el build de Angular. Con SSR actual, usa Docker o una plataforma que ejecute Node (Cloud Run, Railway, Render, Fly.io).

---

## 3. Orden recomendado

1. Tener PostgreSQL accesible desde internet (o desde la red de tu cloud).
2. Desplegar el **backend** y anotar la URL pública (ej. `https://test-app-backend-xxx.run.app`).
3. Poner esa URL en `environment.prod.ts` → `apiBaseUrl`.
4. Desplegar el **frontend** (Docker o Cloud Run / Railway / Render / Fly.io).
5. Abrir la URL del frontend y comprobar que las llamadas al API funcionan.

---

## 4. Resumen de puertos

| Servicio  | Puerto por defecto | Variable de entorno |
|----------|--------------------|----------------------|
| Backend  | 8080               | `PORT`               |
| Frontend | 4000               | `PORT`               |

---

## 5. Comprobar que todo funciona

- Backend: `curl https://tu-backend/health` (o el endpoint que tengas).
- Frontend: abrir en el navegador y ver que la app carga y que las peticiones al API van a la URL configurada en `apiBaseUrl`.
