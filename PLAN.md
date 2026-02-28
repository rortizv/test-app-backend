# Plan: CRUD Especialistas + Despliegue Google Cloud

Aplicación sin login: frontend Angular 21 + backend NestJS 11 + PostgreSQL. Despliegue: Firebase App Hosting (front), Cloud Run (back), Cloud SQL (PostgreSQL).

---

## Fase 1: Base de datos y Backend (NestJS)

### 1.1 Base de datos PostgreSQL (local / Cloud SQL después)

- [ ] **1.1.1** Definir esquema de la tabla `especialistas`:
  - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - `name` VARCHAR(255) NOT NULL
  - `id_number` VARCHAR(50) NOT NULL
  - `phone` VARCHAR(50)
  - `email` VARCHAR(255)
  - `address` TEXT
  - `is_active` BOOLEAN DEFAULT true
  - `created_at` TIMESTAMPTZ DEFAULT NOW()

- [ ] **1.1.2** Crear instancia Cloud SQL PostgreSQL (o script SQL para crear tabla en BD existente).

### 1.2 Backend – dependencias y configuración

- [ ] **1.2.1** Instalar en el backend: `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/config`, `class-validator`, `class-transformer`, `uuid`.
- [ ] **1.2.2** Configurar variables de entorno (`.env` / módulo Config): `DATABASE_URL` o host, port, user, password, database.
- [ ] **1.2.3** Registrar TypeORM en `AppModule` con entidad `Especialista` y opciones para PostgreSQL.

### 1.3 Backend – entidad, DTOs e interfaces

- [ ] **1.3.1** Crear entidad `Especialista` (TypeORM) con columnas id (uuid), name, idNumber, phone, email, address, isActive, createdAt.
- [ ] **1.3.2** Crear interfaces TypeScript para respuestas y payloads (ej. `IEspecialista`, `IEspecialistaCreate`, etc.).
- [ ] **1.3.3** Crear DTOs con class-validator: `CreateEspecialistaDto`, `UpdateEspecialistaDto` (PATCH parcial si aplica).
- [ ] **1.3.4** Crear DTO o interface para respuesta paginada si se usa (opcional para v1 simple).

### 1.4 Backend – servicio y controlador

- [ ] **1.4.1** Crear `EspecialistasService`: `findAll()`, `findOne(id)`, `create(dto)`, `update(id, dto)`, `remove(id)`, `toggleActive(id)` (o incluir en update).
- [ ] **1.4.2** Crear `EspecialistasController`: GET `/especialistas`, GET `/especialistas/:id`, POST `/especialistas`, PATCH `/especialistas/:id`, DELETE `/especialistas/:id`. Sin guards de auth.
- [ ] **1.4.3** Habilitar ValidationPipe global y transformación para DTOs.
- [ ] **1.4.4** Asegurar que el backend escuche en `0.0.0.0` y use `PORT` de env (para Cloud Run).

### 1.5 Backend – manejo de errores

- [ ] **1.5.1** Crear filtro de excepciones HTTP (Exception Filter) o interceptor que capture excepciones (ej. `NotFoundException`, errores de validación) y devuelva respuestas con código y mensaje consistentes.
- [ ] **1.5.2** Registrar el filtro/interceptor globalmente en `main.ts` o en el módulo.

### 1.6 Backend – CORS y script SQL

- [ ] **1.6.1** Habilitar CORS en `main.ts` (origen del frontend para desarrollo y dominio de Firebase App Hosting en producción).
- [ ] **1.6.2** Crear script SQL `create-table-especialistas.sql` (o migración TypeORM) para crear la tabla, documentado en README o en este plan.

---

## Fase 2: Frontend (Angular 21)

### 2.1 Configuración y estilos

- [ ] **2.1.1** Verificar que Tailwind esté correctamente configurado (postcss + `@import 'tailwindcss'` en estilos globales). Ajustar si falta.
- [ ] **2.1.2** Definir variable de entorno o `environment` con la URL base del API (backend), para desarrollo y producción.

### 2.2 Modelos y servicios HTTP

- [ ] **2.2.1** Crear interfaz/modelo `Especialista` en el frontend (id, name, idNumber, phone, email, address, isActive, createdAt).
- [ ] **2.2.2** Crear servicio Angular (ej. `EspecialistasService`) que use `HttpClient`: GET lista, GET por id, POST crear, PATCH actualizar, DELETE. Tipado con la interfaz y manejo de errores (opcional: interceptor HTTP para errores globales).

### 2.3 Vista principal – tabla

- [ ] **2.3.1** Crear componente de vista única (ej. lista o “especialistas”) que muestre una tabla con columnas: Nombre, Cédula, Teléfono, Acciones.
- [ ] **2.3.2** Cada fila: datos de nombre, idNumber, phone; última columna con botones: Toggle isActive, Eliminar, Editar.
- [ ] **2.3.3** Estilo con Tailwind (tabla responsive, botones claros, estado activo/inactivo visible).
- [ ] **2.3.4** Botón o zona para “Nuevo especialista” que abra modal de creación (o mismo modal en modo crear/editar).

### 2.4 Modal de creación/edición

- [ ] **2.4.1** Modal con formulario: name, idNumber, phone, email, address, isActive (checkbox). En edición, prellenar con los datos del especialista.
- [ ] **2.4.2** Validación de campos (required donde corresponda, email válido, etc.). Botón “Actualizar” (o “Guardar” en crear) habilitado solo si el formulario es válido y, en edición, al menos un campo cambió.
- [ ] **2.4.3** Botones Cancelar y Actualizar/Guardar; al guardar, llamar al servicio y cerrar modal actualizando la tabla.

### 2.5 Acciones de la tabla

- [ ] **2.5.1** Toggle isActive: llamar PATCH al backend con el nuevo valor de `isActive` y actualizar la fila en la UI.
- [ ] **2.5.2** Eliminar: confirmación (confirm o modal) y luego DELETE; quitar la fila de la tabla o refrescar lista.
- [ ] **2.5.3** Editar: abrir modal con los datos del especialista y comportamiento descrito en 2.4.

### 2.6 Interceptor HTTP (opcional pero recomendado)

- [ ] **2.6.1** Interceptor que capture errores (4xx/5xx) y muestre mensaje al usuario o redirija si aplica (en esta app simple puede ser solo mensaje).

---

## Fase 3: Despliegue en Google Cloud

### 3.1 Cloud SQL (PostgreSQL)

- [ ] **3.1.1** Crear proyecto GCP (o usar existente) y habilitar APIs: Cloud SQL Admin API.
- [ ] **3.1.2** Crear instancia Cloud SQL para PostgreSQL (versión reciente).
- [ ] **3.1.3** Crear base de datos y usuario; ejecutar script de creación de tabla `especialistas`.
- [ ] **3.1.4** Anotar connection name (para Cloud Run) y configurar acceso (autorizar red de Cloud Run o IP pública con SSL si aplica).

### 3.2 Backend en Cloud Run

- [ ] **3.2.1** Crear `Dockerfile` para el backend NestJS (multi-stage: build + run con `node`).
- [ ] **3.2.2** Configurar `DATABASE_URL` (o variables equivalentes) para conexión a Cloud SQL (conexión por socket o IP según configuración).
- [ ] **3.2.3** Desplegar servicio en Cloud Run (imagen desde Artifact Registry o Container Registry), sin estado en disco; toda persistencia vía PostgreSQL.
- [ ] **3.2.4** Documentar URL del servicio (ej. `https://xxx.run.app`) para usarla en el frontend.

### 3.3 Frontend en Firebase App Hosting

- [ ] **3.3.1** Configurar proyecto en Firebase (vinculado a GCP si es necesario).
- [ ] **3.3.2** Configurar Angular para que en build de producción use la URL del backend (Cloud Run) como API base.
- [ ] **3.3.3** Configurar Firebase App Hosting (firebase.json, etc.) y desplegar build estático (ng build).
- [ ] **3.3.4** Ajustar CORS en el backend para permitir el origen del dominio de Firebase App Hosting.

### 3.4 Comprobación end-to-end

- [ ] **3.4.1** Probar desde la URL del frontend: listar, crear, editar, toggle activo y eliminar especialistas; verificar que los datos persisten en Cloud SQL.

---

## Resumen de entregables

| Componente        | Entregable                                                                 |
|-------------------|----------------------------------------------------------------------------|
| BD                | Tabla `especialistas` en PostgreSQL (script SQL o migración)               |
| Backend           | Módulo Especialistas (entity, DTOs, service, controller), interceptor/filtro de errores, CORS, variables de entorno |
| Frontend          | Vista tabla + modal crear/editar, servicio HTTP, validación y botón actualizar condicional |
| Cloud             | Cloud SQL instancia + BD + tabla; Cloud Run backend; Firebase App Hosting frontend |

---

## Orden sugerido de ejecución

1. Fase 1 completa (BD local o script + backend completo).
2. Fase 2 completa (frontend con tabla, modal, acciones).
3. Probar en local (front apuntando al back local, BD local).
4. Fase 3: Cloud SQL → Cloud Run → Firebase App Hosting → pruebas E2E.

---

*Documento vivo: ir marcando las tareas con `[x]` a medida que se completen.*
