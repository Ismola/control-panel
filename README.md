# Control Panel

Panel de administracion para servicios con React (frontend) y Node.js (backend).

Objetivos principales:

- Recibir fallos de servicios via API.
- Enviar emails a desarrolladores por proyecto usando plantilla configurable.
- Crear tareas en Notion por proyecto (opcional).
- Operar stacks de Portainer (stats, stop, restart) por proyecto.
- Ejecutar healthchecks configurables por proyecto y disparar acciones cuando fallan.
- Desplegar con imagenes publicadas en GHCR (sin `build` en compose de deploy).

## Arquitectura

- `backend`: API Express + MongoDB + integraciones (Email, Notion, Portainer).
- `frontend`: React + Vite para administracion de proyectos y visibilidad operativa.
- `compose.yaml`: despliegue usando imagenes GHCR.
- `compose.dev.yaml`: entorno local incluyendo MongoDB.

## Estructura

```text
.
├─ backend/
├─ frontend/
├─ compose.yaml
├─ compose.dev.yaml
├─ infra/compose/
└─ .github/workflows/
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar valores.

Variables base:

- `NODE_ENV`: `development|test|production`
- `PORT`: puerto del backend (default 8080)
- `MONGODB_URI`: cadena de conexion Mongo
- `JWT_SECRET`: clave para autenticacion futura
- `VITE_API_BASE_URL`: URL base del backend para frontend

## Modelo por proyecto

Cada proyecto guarda su propia configuracion:

- `emailConfig`: SMTP, remitente, destinatarios, plantilla asunto/cuerpo.
- `notionConfig`: habilitado, token, databaseId, mapeo de propiedades.
- `portainerConfig`: URL, token, endpointId, stackId.
- `healthchecks[]`: URL, metodo, intervalo, timeout, status esperado, retries.
- `ingestToken`: token opcional para validar `POST /incidents`.

## API principal

Base URL: `/api/v1`

- `GET /health`
- `GET /projects`
- `POST /projects`
- `PATCH /projects/:id`
- `GET /projects/:id/healthchecks/history`
- `POST /projects/:id/test-email`
- `POST /projects/:id/test-notion`
- `POST /incidents`
  - Header opcional: `x-project-token`
- `GET /portainer/projects/:projectId/stacks/stats`
- `POST /portainer/projects/:projectId/stacks/restart`
- `POST /portainer/projects/:projectId/stacks/stop`

### Ejemplo de incidente

```bash
curl -X POST http://localhost:8080/api/v1/incidents \
  -H "Content-Type: application/json" \
  -H "x-project-token: my-project-token" \
  -d '{
    "projectSlug": "billing-api",
    "serviceName": "billing-worker",
    "severity": "high",
    "message": "Queue processing timeout",
    "details": {"jobId": "a1b2c3"}
  }'
```

## Desarrollo local

> Este entorno actual debe reconstruirse con el nuevo devcontainer para tener Node/npm disponibles.

1. Rebuild del devcontainer.
2. Instalar dependencias:

```bash
cd backend && npm install
cd ../frontend && npm install
```

1. Ejecutar backend:

```bash
cd backend && npm run dev
```

1. Ejecutar frontend:

```bash
cd frontend && npm run dev
```

## Compose de despliegue (sin build)

`compose.yaml` usa imagenes publicadas:

- `ghcr.io/siryus-org/control-panel-backend:latest`
- `ghcr.io/siryus-org/control-panel-frontend:latest`

Despliegue:

```bash
docker compose up -d
```

## Compose local con Mongo

`compose.dev.yaml` incluye `mongo:7` para desarrollo local.

```bash
docker compose -f compose.dev.yaml up -d
```

## CI/CD

Workflows:

- `test.yml`: lint + test + build para backend y frontend.
- `docker-publish.yml`: build y push de imagenes a GHCR (backend y frontend).
- `deploy.yml`: en push a `main`, ejecuta CI, publica imagenes y opcionalmente llama webhook de Portainer.

Secrets recomendados:

- `PORTAINER_DEPLOY_WEBHOOK` (opcional)

## Seguridad y mejoras propuestas

Mejoras recomendadas para siguiente iteracion:

- Cifrar credenciales SMTP/Notion/Portainer en base de datos.
- Añadir autenticacion y RBAC en panel admin.
- Rate limit en `POST /incidents`.
- Cola de eventos para notificaciones (retries/backoff).
- OpenTelemetry + trazas y metricas de healthchecks.
- Dedupe avanzado de incidencias por ventana temporal.
