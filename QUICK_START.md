# Control Panel - Quick Start Guide

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker y Docker Compose instalados
- Puertos disponibles: 8080, 5173, 27017

### Iniciar la Aplicación

```bash
# 1. Clonar el repositorio (si aplica)
git clone <repository-url>
cd control-panel

# 2. Copiar archivos de configuración
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Iniciar todos los servicios
docker-compose up -d --build

# 4. Verificar que todo está funcionando
docker-compose ps
```

### Acceder a la Aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **Documentación API:** http://localhost:8080/docs
- **MongoDB:** mongodb://localhost:27017/control-panel

### Credenciales por Defecto

```
Email: admin@example.com
Password: admin123
```

⚠️ **Importante:** Cambiar estas credenciales en producción editando `backend/.env`

---

## 📋 Servicios Disponibles

### 1. Frontend (React + Vite)
- Framework: React 18.3.1
- UI: shadcn/ui + Tailwind CSS
- Servidor: Nginx 1.27 (producción)
- Puerto: 5173

### 2. Backend (Fastify + Node.js)
- Framework: Fastify 5.2
- Runtime: Node.js 22
- Puerto: 8080
- Endpoints principales:
  - `/health` - Health check
  - `/docs` - Documentación Swagger
  - `/auth/*` - Autenticación
  - `/api/projects` - Gestión de proyectos
  - `/api/notifications` - Notificaciones

### 3. Base de Datos (MongoDB)
- Versión: MongoDB 7
- Puerto: 27017
- Base de datos: control-panel

---

## 🧪 Probar la Aplicación

### Opción 1: Interfaz Web
1. Abrir http://localhost:5173 en el navegador
2. Iniciar sesión con las credenciales por defecto
3. Crear un nuevo proyecto
4. Configurar notificaciones y health checks

### Opción 2: API con curl

```bash
# Health check
curl http://localhost:8080/health

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Obtener token y guardar en variable
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r .token)

# Listar proyectos
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/projects

# Crear proyecto
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Proyecto",
    "description": "Descripción del proyecto",
    "emailNotifications": {
      "enabled": true,
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpUser": "tu-email@gmail.com",
      "smtpPassword": "tu-contraseña",
      "from": "noreply@example.com",
      "recipients": ["dev@example.com"]
    }
  }'
```

### Opción 3: Script Automatizado

```bash
# Ejecutar suite de pruebas
chmod +x test-api.sh
./test-api.sh
```

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongo

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ elimina datos de BD)
docker-compose down -v

# Reconstruir servicios
docker-compose up -d --build
```

### Desarrollo Local

```bash
# Backend (modo desarrollo con hot reload)
cd backend
npm install
npm run dev

# Frontend (modo desarrollo)
cd frontend
npm install
npm run dev

# Tests
npm test
```

---

## 📚 Funcionalidades Principales

### 1. Gestión de Proyectos
- Crear, editar y eliminar proyectos
- Cada proyecto tiene su propia API key
- Configuración de notificaciones por proyecto

### 2. Health Checks Automáticos
- Configurar checks HTTP por proyecto
- Intervalos personalizables
- Detección automática de fallos
- Prevención de flapping

### 3. Sistema de Notificaciones
- **Email:** SMTP configurable con templates personalizados
- **Notion:** Creación automática de tasks en Notion
- Templates con variables dinámicas
- Reintentos automáticos con backoff exponencial

### 4. Integración con Portainer
- Ver estadísticas de stacks Docker
- Iniciar/detener/reiniciar stacks
- Gestión remota de contenedores

### 5. Autenticación y Seguridad
- JWT tokens
- Protección de rutas
- CORS configurado
- Headers de seguridad

---

## 📖 Documentación Adicional

- [README.md](README.md) - Descripción general del proyecto
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía de despliegue
- [TEST_RESULTS.md](TEST_RESULTS.md) - Resultados de pruebas
- [FRONTEND_IMPLEMENTATION.md](FRONTEND_IMPLEMENTATION.md) - Detalles del frontend

---

## ⚠️ Configuración de Producción

Antes de desplegar en producción, asegúrate de:

1. **Cambiar secretos en backend/.env:**
   ```bash
   JWT_SECRET=<generar-secreto-aleatorio-de-32-caracteres>
   ADMIN_PASSWORD=<contraseña-segura>
   ```

2. **Configurar MongoDB con autenticación:**
   ```yaml
   # En docker-compose.yml
   MONGO_INITDB_ROOT_USERNAME: admin
   MONGO_INITDB_ROOT_PASSWORD: <contraseña-segura>
   ```

3. **Configurar HTTPS:**
   - Usar reverse proxy (Nginx, Traefik, Caddy)
   - Certificados SSL (Let's Encrypt)

4. **Configurar variables de entorno:**
   - SMTP real para notificaciones email
   - API keys de Notion si se usa
   - URLs de Portainer si se usa

5. **Backup de base de datos:**
   ```bash
   # Backup
   docker exec control-panel-mongo mongodump -d control-panel -o /backup
   
   # Restore
   docker exec control-panel-mongo mongorestore /backup
   ```

---

## 🐛 Solución de Problemas

### El backend no inicia
```bash
# Verificar logs
docker-compose logs backend

# Verificar que MongoDB está healthy
docker-compose ps

# Reconstruir
docker-compose up -d --build backend
```

### Error de conexión a MongoDB
```bash
# Verificar que MongoDB está corriendo
docker-compose ps mongo

# Verificar logs de MongoDB
docker-compose logs mongo

# Reiniciar MongoDB
docker-compose restart mongo
```

### Frontend no carga
```bash
# Verificar que Nginx está sirviendo
docker exec control-panel-frontend ls -la /usr/share/nginx/html/

# Ver logs
docker-compose logs frontend

# Reconstruir
docker-compose up -d --build frontend
```

---

## 📞 Soporte

Para reportar problemas o solicitar funcionalidades, crear un issue en el repositorio.

---

**¡Listo para usar!** 🎉
