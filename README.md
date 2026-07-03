# Control Panel - Service Monitoring

Panel de administración para monitoreo de servicios con notificaciones automáticas y gestión de infraestructura Docker.

## 🎯 Características Principales

- ✅ **Autenticación JWT** - Sistema de login seguro
- ✅ **Gestión de Proyectos** - CRUD completo con API keys únicas
- ✅ **Health Checks Automáticos** - Monitoreo periódico configurable
- ✅ **Notificaciones Email** - SMTP con templates personalizables y reintentos
- ✅ **Integración Notion** - Creación automática de tareas en bases de datos
- ✅ **Integración Portainer** - Control completo de stacks Docker
- ✅ **Templates de Email** - Sistema de plantillas con variables dinámicas
- ✅ **Dashboard Web** - Interfaz React moderna con shadcn/ui
- ✅ **API REST Completa** - Documentación Swagger incluida
- ✅ **Docker Ready** - Deploy completo con docker-compose

## 📦 Stack Tecnológico

### Backend
- **Framework:** Fastify 5.2 + TypeScript 5.7
- **Base de Datos:** MongoDB 7 + Mongoose 8.9
- **Autenticación:** JWT + bcrypt
- **Email:** Nodemailer con pool de conexiones
- **Notion:** @notionhq/client 2.2
- **Portainer:** Cliente Axios personalizado
- **Scheduling:** node-schedule (cron)
- **Logging:** Pino
- **Documentación:** Swagger/OpenAPI

### Frontend
- **Framework:** React 18.3 + TypeScript 5.7
- **UI Library:** shadcn/ui + Tailwind CSS 3.4
- **Routing:** React Router 7
- **State Management:** React Query 5
- **Build Tool:** Vite 6
- **Servidor Producción:** Nginx 1.27

### DevOps
- **Containerización:** Docker multi-stage builds
- **Orquestación:** Docker Compose
- **CI/CD:** GitHub Actions (configurado)
- **Registry:** GitHub Container Registry (GHCR)

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker y Docker Compose
- Node.js 22+ (solo para desarrollo local)
- Puertos disponibles: 8080 (backend), 5173 (frontend), 27017 (MongoDB)

### Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/Ismola/control-panel.git
cd control-panel

# Copiar archivos de configuración
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Iniciar todos los servicios
docker-compose up -d --build

# Verificar que todo está funcionando
docker-compose ps

# Ver logs
docker-compose logs -f
```

### Acceso a la Aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **Documentación Swagger:** http://localhost:8080/docs
- **MongoDB:** mongodb://localhost:27017/control-panel

### Credenciales por Defecto

```
Email: admin@example.com
Password: admin123
```

⚠️ **IMPORTANTE:** Cambiar estas credenciales en producción editando `backend/.env`

## 📚 Documentación Completa

### Guías de Usuario
- **[Inicio Rápido](QUICK_START.md)** - Tutorial paso a paso
- **[Integraciones](docs/INTEGRATIONS.md)** - Configurar Email, Notion y Portainer
- **[Estado de Integraciones](docs/INTEGRATIONS_STATUS.md)** - Estado completo de implementación

### Guías Técnicas
- **[Guía de Despliegue](DEPLOYMENT_GUIDE.md)** - Deploy en producción
- **[Resultados de Tests](TEST_RESULTS.md)** - Pruebas ejecutadas y validación
- **[Frontend](FRONTEND_IMPLEMENTATION.md)** - Detalles de implementación React

### Ejemplos
- **[Ejemplos de Configuración](docs/examples/)** - Archivos JSON listos para usar

## 🔧 Configuración de Integraciones

### 📧 Email (SMTP)

Soporta **cualquier servidor SMTP**: Gmail, SendGrid, Mailgun, Office 365, Amazon SES, etc.

**Ejemplo con Gmail:**
```json
{
  "emailNotifications": {
    "enabled": true,
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "smtpUser": "tu-email@gmail.com",
    "smtpPassword": "tu-app-password",
    "from": "Control Panel <noreply@ejemplo.com>",
    "recipients": ["dev1@ejemplo.com", "dev2@ejemplo.com"]
  }
}
```

**Características:**
- ✅ Reintentos automáticos (3 intentos con backoff exponencial)
- ✅ Pool de conexiones para mejor rendimiento
- ✅ Templates HTML y texto plano
- ✅ Variables dinámicas en templates
- ✅ Logging completo de envíos

**Ver más:** [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md#-integración-de-email-smtp)

### 📝 Notion

Crea tareas automáticamente en tu base de datos de Notion cuando hay fallos.

**Configuración:**
```json
{
  "notionNotifications": {
    "enabled": true,
    "integrationToken": "secret_abc123...",
    "databaseId": "abc123def456...",
    "propertyMappings": {
      "title": "Name",
      "description": "Description",
      "priority": "Priority",
      "status": "Status"
    }
  }
}
```

**Características:**
- ✅ Property mappings personalizables
- ✅ Soporte para diferentes tipos de campos
- ✅ Prioridades automáticas (High/Medium/Low)
- ✅ Estados configurables
- ✅ Emojis para mejor visualización

**Pasos de configuración:**
1. Crear integración en https://www.notion.so/my-integrations
2. Crear base de datos y compartir con la integración
3. Obtener Database ID de la URL
4. Configurar property mappings

**Ver más:** [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md#-integración-de-notion)

### 🐳 Portainer

Gestiona tus stacks Docker directamente desde el Control Panel.

**Configuración:**
```json
{
  "portainerConfig": {
    "enabled": true,
    "apiUrl": "https://portainer.ejemplo.com",
    "apiToken": "ptr_abc123...",
    "endpointId": 1
  }
}
```

**Funcionalidades:**
- ✅ Listar todos los stacks
- ✅ Ver detalles de cada stack
- ✅ Iniciar/Detener/Reiniciar stacks
- ✅ Caché de 30 segundos
- ✅ Manejo de errores robusto

**Endpoints disponibles:**
- `GET /api/projects/{projectId}/portainer/stacks`
- `POST /api/projects/{projectId}/portainer/stacks/{stackId}/start`
- `POST /api/projects/{projectId}/portainer/stacks/{stackId}/stop`
- `POST /api/projects/{projectId}/portainer/stacks/{stackId}/restart`

**Ver más:** [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md#-integración-de-portainer)

### 🎯 Configuración Interactiva

Usa el script de configuración guiada:

```bash
./test-integrations.sh
```

Este script te guía paso a paso para configurar:
- Email (con ejemplos para diferentes proveedores)
- Notion (con instrucciones para obtener tokens)
- Portainer (con configuración de endpoints)
- Todas las integraciones a la vez
- Pruebas de integraciones existentes

## 🧪 Pruebas y Testing

### Tests Automáticos

```bash
# Tests de API completos
./test-api.sh

# Configurar y probar integraciones
./test-integrations.sh

# Ver logs en tiempo real
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo
```

### Tests Ejecutados

Todas las pruebas pasaron exitosamente:
- ✅ Health check endpoint
- ✅ Autenticación JWT
- ✅ CRUD de proyectos
- ✅ Creación de health checks
- ✅ Sistema de notificaciones
- ✅ Frontend servido correctamente

**Ver detalles:** [TEST_RESULTS.md](TEST_RESULTS.md)

## 📊 Uso del API

### Autenticación

```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Respuesta
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "admin@example.com"
  }
}
```

### Gestión de Proyectos

```bash
TOKEN="tu-jwt-token"

# Listar proyectos
curl http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN"

# Crear proyecto (con ejemplo completo)
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @docs/examples/project-complete.json

# Obtener proyecto
curl http://localhost:8080/api/projects/{projectId} \
  -H "Authorization: Bearer $TOKEN"
```

### Health Checks

```bash
# Crear health check
curl -X POST http://localhost:8080/api/projects/{projectId}/health-checks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Health Check",
    "url": "https://api.ejemplo.com/health",
    "interval": "*/5 * * * *",
    "timeout": 5000,
    "enabled": true
  }'

# Listar health checks
curl http://localhost:8080/api/projects/{projectId}/health-checks \
  -H "Authorization: Bearer $TOKEN"
```

### Enviar Notificaciones

Desde cualquier servicio externo usando la API Key del proyecto:

```bash
curl -X POST http://localhost:8080/api/notifications/failure \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cp_tu-api-key" \
  -d '{
    "serviceName": "Mi Servicio",
    "error": "Error de conexión a la base de datos",
    "timestamp": "2026-07-03T10:00:00Z",
    "severity": "critical",
    "metadata": {
      "url": "https://api.ejemplo.com",
      "responseTime": 5000
    }
  }'
```

Esto enviará notificaciones automáticamente vía:
- Email (si configurado)
- Notion (si configurado)

## 🏗️ Arquitectura

```
┌──────────────────┐
│  React Frontend  │ (Nginx/Vite)
│   Port: 5173     │
└────────┬─────────┘
         │ HTTP
         ▼
┌──────────────────┐      ┌─────────────────┐
│  Fastify Backend │─────▶│    MongoDB      │
│   Port: 8080     │      │   Port: 27017   │
└────────┬─────────┘      └─────────────────┘
         │
    ┌────┼────┬─────────────┐
    │    │    │             │
    ▼    ▼    ▼             ▼
  Email Notion Portainer  Scheduler
  (SMTP) (API)  (API)    (node-schedule)
                               │
                               ▼
                          Health Checks
                          (HTTP requests)
```

### Flujo de Notificaciones

```
Service Failure
    │
    ├─▶ Health Check detecta fallo
    │   (o llamada directa a /api/notifications/failure)
    │
    ▼
Notification Service
    │
    ├─▶ Email Service ───▶ SMTP Server ───▶ 📧 Desarrolladores
    │
    └─▶ Notion Service ──▶ Notion API ────▶ 📝 Tarea creada
```

## 🛠️ Desarrollo Local

### Sin Docker

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev

# MongoDB debe estar corriendo
# Ajustar MONGODB_URI en backend/.env si es necesario
```

### Con Docker

```bash
# Reconstruir servicios
docker-compose up -d --build

# Reconstruir solo un servicio
docker-compose up -d --build backend

# Ver logs
docker-compose logs -f backend

# Reiniciar servicio
docker-compose restart backend

# Entrar al contenedor
docker exec -it control-panel-backend sh
```

## 📝 Variables de Entorno

### Backend (.env)

```bash
# Servidor
NODE_ENV=development
PORT=8080
HOST=0.0.0.0

# Base de datos
MONGODB_URI=mongodb://mongo:27017/control-panel

# JWT (cambiar en producción)
JWT_SECRET=tu-secreto-de-minimo-32-caracteres
JWT_EXPIRES_IN=24h

# Admin (cambiar en producción)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=tu-password-seguro

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8080
VITE_ENV=development
```

## 🚀 Despliegue en Producción

### Con Docker Compose

```bash
# Usar configuración de producción
docker-compose -f docker-compose.production.yml up -d

# O con variables de entorno
NODE_ENV=production docker-compose up -d
```

### Consideraciones de Seguridad

1. **Cambiar secretos:**
   ```bash
   JWT_SECRET=<generar-secreto-de-32+-caracteres>
   ADMIN_PASSWORD=<password-fuerte>
   ```

2. **Configurar MongoDB con autenticación:**
   ```yaml
   MONGO_INITDB_ROOT_USERNAME: admin
   MONGO_INITDB_ROOT_PASSWORD: <password-seguro>
   ```

3. **Usar HTTPS:**
   - Configurar reverse proxy (Nginx, Traefik, Caddy)
   - Obtener certificados SSL (Let's Encrypt)

4. **Configurar firewall:**
   - Exponer solo puertos necesarios
   - Usar security groups en cloud

**Ver más:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📂 Estructura del Proyecto

```
control-panel/
├── backend/                 # API Fastify + TypeScript
│   ├── src/
│   │   ├── config/         # Configuración y DB
│   │   ├── models/         # Modelos Mongoose
│   │   ├── routes/         # Rutas de la API
│   │   ├── services/       # Lógica de negocio
│   │   ├── middleware/     # Auth, logging, etc.
│   │   ├── jobs/           # Scheduled tasks
│   │   └── server.ts       # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # React + shadcn/ui
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Context providers
│   │   ├── pages/         # Páginas principales
│   │   └── services/      # API client
│   ├── Dockerfile
│   └── package.json
│
├── docs/                   # Documentación
│   ├── examples/          # Ejemplos de configuración
│   ├── INTEGRATIONS.md    # Guía de integraciones
│   └── INTEGRATIONS_STATUS.md
│
├── docker-compose.yml      # Desarrollo
├── docker-compose.production.yml
├── QUICK_START.md
├── DEPLOYMENT_GUIDE.md
├── TEST_RESULTS.md
└── README.md              # Este archivo
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

## 🆘 Soporte

- Documentación completa en `docs/`
- Issues: https://github.com/Ismola/control-panel/issues
- Ejemplos: `docs/examples/`

## ✨ Estado del Proyecto

**Versión:** 1.0.0
**Estado:** ✅ Producción Ready

**Completado:**
- ✅ Backend API completo (30+ endpoints)
- ✅ Frontend React con interfaz moderna
- ✅ Integración Email (SMTP)
- ✅ Integración Notion
- ✅ Integración Portainer
- ✅ Health checks automáticos
- ✅ Sistema de notificaciones multi-canal
- ✅ Documentación completa
- ✅ Scripts de testing
- ✅ Docker deployment

**Próximas mejoras:**
- Tests unitarios y E2E
- Integración con Slack/Discord
- Métricas y dashboards avanzados
- Multi-idioma

---

**¡Listo para usar en producción!** 🎉

Para comenzar: `docker-compose up -d --build`

Luego visita: http://localhost:5173
