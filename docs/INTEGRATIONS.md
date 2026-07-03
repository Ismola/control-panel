# Guía de Integraciones

Esta guía explica cómo configurar y usar las integraciones disponibles en el Control Panel.

---

## 📧 Integración de Email (SMTP)

### Descripción
Envía notificaciones por email cuando los servicios monitoreados fallan. Soporta cualquier servidor SMTP compatible.

### Configuración

#### 1. Servicios SMTP Recomendados

**Gmail**
```json
{
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "tu-email@gmail.com",
      "pass": "tu-app-password"
    }
  },
  "from": "Control Panel <noreply@tudominio.com>",
  "developers": ["dev1@ejemplo.com", "dev2@ejemplo.com"]
}
```

**Nota Gmail:** Necesitas generar una "App Password" en https://myaccount.google.com/apppasswords

**SendGrid**
```json
{
  "smtp": {
    "host": "smtp.sendgrid.net",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "apikey",
      "pass": "TU_SENDGRID_API_KEY"
    }
  },
  "from": "Control Panel <noreply@tudominio.com>",
  "developers": ["dev1@ejemplo.com"]
}
```

**Mailgun**
```json
{
  "smtp": {
    "host": "smtp.mailgun.org",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "postmaster@tudominio.mailgun.org",
      "pass": "TU_MAILGUN_PASSWORD"
    }
  },
  "from": "Control Panel <noreply@tudominio.com>",
  "developers": ["dev1@ejemplo.com"]
}
```

**Office 365 / Outlook**
```json
{
  "smtp": {
    "host": "smtp.office365.com",
    "port": 587,
    "secure": false,
    "auth": {
      "user": "tu-email@outlook.com",
      "pass": "tu-password"
    }
  },
  "from": "Control Panel <noreply@tudominio.com>",
  "developers": ["dev1@ejemplo.com"]
}
```

**Servidor SMTP Propio**
```json
{
  "smtp": {
    "host": "smtp.tudominio.com",
    "port": 465,
    "secure": true,
    "auth": {
      "user": "usuario",
      "pass": "contraseña"
    }
  },
  "from": "Control Panel <noreply@tudominio.com>",
  "developers": ["dev1@ejemplo.com"]
}
```

#### 2. Crear Proyecto con Email

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Proyecto",
    "description": "Proyecto con notificaciones email",
    "emailNotifications": {
      "enabled": true,
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpUser": "tu-email@gmail.com",
      "smtpPassword": "tu-app-password",
      "from": "Control Panel <noreply@ejemplo.com>",
      "recipients": ["dev@ejemplo.com", "ops@ejemplo.com"]
    }
  }'
```

#### 3. Templates de Email

Los templates soportan variables dinámicas:

**Variables disponibles:**
- `{{serviceName}}` - Nombre del servicio que falló
- `{{error}}` - Mensaje de error
- `{{timestamp}}` - Fecha y hora del fallo
- `{{severity}}` - Nivel de severidad (critical, warning, info)
- `{{projectName}}` - Nombre del proyecto
- `{{metadata.*}}` - Cualquier metadata adicional

**Ejemplo de template:**
```html
<h2>⚠️ Fallo en Servicio</h2>
<p><strong>Servicio:</strong> {{serviceName}}</p>
<p><strong>Proyecto:</strong> {{projectName}}</p>
<p><strong>Error:</strong> {{error}}</p>
<p><strong>Severidad:</strong> {{severity}}</p>
<p><strong>Timestamp:</strong> {{timestamp}}</p>

{{#if metadata.url}}
<p><strong>URL:</strong> {{metadata.url}}</p>
{{/if}}

<hr>
<p style="color: #666; font-size: 12px;">
  Este es un mensaje automático del Control Panel
</p>
```

#### 4. Probar Email

```bash
# Enviar notificación de prueba
curl -X POST http://localhost:8080/api/notifications/failure \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu-project-api-key" \
  -d '{
    "serviceName": "API de Prueba",
    "error": "Error de conexión timeout",
    "timestamp": "2026-07-03T10:00:00Z",
    "severity": "critical",
    "metadata": {
      "url": "https://api.ejemplo.com/health",
      "responseTime": 5000
    }
  }'
```

---

## 📝 Integración de Notion

### Descripción
Crea tareas automáticas en Notion cuando ocurren fallos en los servicios monitoreados.

### Configuración

#### 1. Crear Integración en Notion

1. Ve a https://www.notion.so/my-integrations
2. Click en "+ New integration"
3. Nombre: "Control Panel"
4. Selecciona el workspace
5. Copia el "Internal Integration Token" (comienza con `secret_`)

#### 2. Crear Base de Datos en Notion

1. Crea una nueva página en Notion
2. Agrega una tabla/base de datos
3. Asegúrate de tener estas columnas (puedes personalizarlas):
   - **Name** (título) - Para el nombre de la tarea
   - **Description** (text) - Para la descripción
   - **Priority** (select) - Para la prioridad (High, Medium, Low)
   - **Status** (select) - Para el estado (To Do, In Progress, Done)
   - **Assigned to** (person) - Para asignar responsables

4. Comparte la base de datos con tu integración:
   - Click en "..." en la esquina superior derecha
   - Click en "Add connections"
   - Busca "Control Panel" y selecciónala

5. Obtén el Database ID:
   - La URL será algo como: `https://www.notion.so/workspace/abc123...?v=def456...`
   - El Database ID es la parte `abc123...` (32 caracteres entre `/` y `?`)

#### 3. Configurar Proyecto con Notion

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Proyecto",
    "description": "Proyecto con notificaciones Notion",
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
  }'
```

#### 4. Mapeo de Propiedades

El mapeo conecta las variables del Control Panel con las columnas de Notion:

```json
{
  "propertyMappings": {
    "title": "Name",           // Campo título (requerido)
    "description": "Description", // Campo de descripción
    "priority": "Priority",    // Campo de prioridad
    "status": "Status",        // Campo de estado
    "assignee": "Assigned to"  // Campo de persona asignada
  }
}
```

#### 5. Valores de Prioridad y Estado

Por defecto, se usan estos valores (puedes personalizarlos):

**Prioridad:**
- `High` - Para fallos críticos
- `Medium` - Para warnings
- `Low` - Para info

**Estado:**
- `To Do` - Estado inicial de la tarea

Asegúrate de que estos valores existan en tus select options de Notion.

#### 6. Probar Notion

```bash
# Enviar notificación que creará una tarea en Notion
curl -X POST http://localhost:8080/api/notifications/failure \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu-project-api-key" \
  -d '{
    "serviceName": "API de Producción",
    "error": "Error 500: Internal Server Error",
    "timestamp": "2026-07-03T10:00:00Z",
    "severity": "critical"
  }'
```

Esto creará una tarea en Notion con:
- **Name**: "🔴 Fallo: API de Producción"
- **Description**: "Error 500: Internal Server Error\n\nTimestamp: 2026-07-03T10:00:00Z"
- **Priority**: "High"
- **Status**: "To Do"

---

## 🐳 Integración de Portainer

### Descripción
Permite ver estadísticas y gestionar stacks de Docker a través de Portainer directamente desde el Control Panel.

### Configuración

#### 1. Obtener API Token de Portainer

**Opción A: Crear Access Token (Recomendado)**

1. Accede a tu Portainer (ej: https://portainer.tudominio.com)
2. Ve a "User settings" (click en tu usuario arriba a la derecha)
3. Click en "Access tokens"
4. Click en "+ Add access token"
5. Nombre: "Control Panel"
6. Copia el token (empieza con `ptr_`)

**Opción B: Autenticación con Usuario/Password**

```bash
# Obtener token temporal (válido 8 horas)
curl -X POST https://portainer.tudominio.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "tu-password"
  }'

# La respuesta incluirá el JWT token
# {"jwt":"eyJhbGc..."}
```

#### 2. Obtener Endpoint ID

```bash
# Listar endpoints
curl https://portainer.tudominio.com/api/endpoints \
  -H "X-API-Key: ptr_tu_token"

# Respuesta:
# [
#   {
#     "Id": 1,
#     "Name": "local",
#     "Type": 1,
#     ...
#   }
# ]
```

El `Id` es tu `endpointId` (normalmente es `1` para el endpoint local).

#### 3. Configurar Proyecto con Portainer

```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Proyecto",
    "description": "Proyecto con integración Portainer",
    "portainerConfig": {
      "enabled": true,
      "apiUrl": "https://portainer.tudominio.com",
      "apiToken": "ptr_abc123...",
      "endpointId": 1
    }
  }'
```

#### 4. Uso de la API de Portainer

**Listar Stacks**
```bash
curl http://localhost:8080/api/projects/{projectId}/portainer/stacks \
  -H "Authorization: Bearer $TOKEN"
```

**Obtener Detalles de Stack**
```bash
curl http://localhost:8080/api/projects/{projectId}/portainer/stacks/{stackId} \
  -H "Authorization: Bearer $TOKEN"
```

**Iniciar Stack**
```bash
curl -X POST http://localhost:8080/api/projects/{projectId}/portainer/stacks/{stackId}/start \
  -H "Authorization: Bearer $TOKEN"
```

**Detener Stack**
```bash
curl -X POST http://localhost:8080/api/projects/{projectId}/portainer/stacks/{stackId}/stop \
  -H "Authorization: Bearer $TOKEN"
```

**Reiniciar Stack**
```bash
curl -X POST http://localhost:8080/api/projects/{projectId}/portainer/stacks/{stackId}/restart \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. Configuración con Docker Local

Si Portainer está corriendo en el mismo host:

```yaml
# docker-compose.yml - Agregar servicio de Portainer
services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: unless-stopped
    ports:
      - "9000:9000"
      - "8000:8000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer-data:/data
    networks:
      - control-panel-network

volumes:
  portainer-data:
```

Luego accede a http://localhost:9000 y crea tu usuario admin.

---

## 🔔 Health Checks Automáticos

### Configuración

Los health checks se ejecutan automáticamente en intervalos configurables:

```bash
# Crear health check
curl -X POST http://localhost:8080/api/projects/{projectId}/health-checks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Health Check",
    "url": "https://api.tudominio.com/health",
    "interval": "*/5 * * * *",
    "timeout": 5000,
    "enabled": true
  }'
```

**Intervalos (formato cron):**
- `*/5 * * * *` - Cada 5 minutos
- `*/15 * * * *` - Cada 15 minutos
- `0 * * * *` - Cada hora
- `0 */6 * * *` - Cada 6 horas
- `0 0 * * *` - Una vez al día (medianoche)

**Cuando falla un health check:**
1. Se incrementa el contador de fallos consecutivos
2. Si alcanza el umbral (2 fallos), envía notificaciones
3. Las notificaciones se envían por Email y/o Notion según configuración
4. Previene spam con cooldown de 5 minutos entre notificaciones

---

## 🧪 Probar Todas las Integraciones

### Script de Prueba Completo

```bash
#!/bin/bash

# Obtener token
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r .token)

# Crear proyecto con todas las integraciones
PROJECT=$(curl -s -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Proyecto Completo",
    "description": "Con todas las integraciones",
    "emailNotifications": {
      "enabled": true,
      "smtpHost": "smtp.gmail.com",
      "smtpPort": 587,
      "smtpUser": "tu-email@gmail.com",
      "smtpPassword": "tu-app-password",
      "from": "Control Panel <noreply@ejemplo.com>",
      "recipients": ["dev@ejemplo.com"]
    },
    "notionNotifications": {
      "enabled": true,
      "integrationToken": "secret_...",
      "databaseId": "...",
      "propertyMappings": {
        "title": "Name",
        "description": "Description",
        "priority": "Priority",
        "status": "Status"
      }
    },
    "portainerConfig": {
      "enabled": true,
      "apiUrl": "https://portainer.tudominio.com",
      "apiToken": "ptr_...",
      "endpointId": 1
    }
  }')

PROJECT_ID=$(echo $PROJECT | jq -r ._id)
API_KEY=$(echo $PROJECT | jq -r .apiKey)

echo "Proyecto creado: $PROJECT_ID"
echo "API Key: $API_KEY"

# Crear health check
curl -X POST http://localhost:8080/api/projects/$PROJECT_ID/health-checks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Health Check",
    "url": "https://httpstat.us/500",
    "interval": "*/1 * * * *",
    "timeout": 5000,
    "enabled": true
  }'

# Enviar notificación de prueba
curl -X POST http://localhost:8080/api/notifications/failure \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "serviceName": "Test Service",
    "error": "This is a test notification",
    "timestamp": "2026-07-03T10:00:00Z",
    "severity": "critical"
  }'

echo "¡Pruebas completadas!"
echo "Verifica tu email y Notion para las notificaciones"
```

---

## 📊 Logs de Notificaciones

Ver el historial de todas las notificaciones enviadas:

```bash
# Ver logs
curl http://localhost:8080/api/notifications/logs \
  -H "Authorization: Bearer $TOKEN"

# Filtrar por proyecto
curl http://localhost:8080/api/notifications/logs?projectId={projectId} \
  -H "Authorization: Bearer $TOKEN"

# Filtrar por tipo
curl http://localhost:8080/api/notifications/logs?type=email \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Troubleshooting

### Email no se envía

1. **Verificar credenciales SMTP:**
   ```bash
   # Probar conexión
   curl -X POST http://localhost:8080/api/projects/{projectId}/test-email \
     -H "Authorization: Bearer $TOKEN"
   ```

2. **Gmail bloquea el acceso:**
   - Usa "App Passwords" en lugar de tu contraseña normal
   - Activa "Less secure app access" (no recomendado)

3. **Verificar logs del backend:**
   ```bash
   docker-compose logs backend | grep -i email
   ```

### Notion no crea tareas

1. **Verificar que la integración tiene acceso a la BD:**
   - En Notion, ve a la base de datos
   - Click "..." → "Add connections"
   - Asegúrate que tu integración está conectada

2. **Verificar el Database ID:**
   - Debe ser exactamente 32 caracteres (sin guiones)
   - Tómalo de la URL entre `/` y `?`

3. **Verificar property mappings:**
   - Los nombres deben coincidir exactamente con Notion
   - Sensible a mayúsculas/minúsculas

### Portainer no conecta

1. **Verificar URL y token:**
   ```bash
   curl https://portainer.tudominio.com/api/endpoints \
     -H "X-API-Key: ptr_tu_token"
   ```

2. **Verificar CORS:**
   - Portainer debe permitir requests desde tu dominio

3. **Verificar endpoint ID:**
   - Listar endpoints y confirmar el ID correcto

---

## 🎯 Mejores Prácticas

### Seguridad
- ✅ Usa variables de entorno para tokens y passwords
- ✅ Nunca commitees credenciales al repositorio
- ✅ Rota los tokens periódicamente
- ✅ Usa HTTPS en producción

### Notificaciones
- ✅ Configura cooldowns apropiados para evitar spam
- ✅ Usa templates personalizados para cada tipo de fallo
- ✅ Agrupa notificaciones cuando sea posible
- ✅ Incluye información de contexto en metadata

### Health Checks
- ✅ No hagas checks muy frecuentes (mínimo 1 minuto)
- ✅ Ajusta timeouts según el servicio
- ✅ Usa URLs específicas de health check, no la página principal
- ✅ Monitorea los logs de notificaciones para detectar problemas

### Portainer
- ✅ Usa Access Tokens en lugar de user/password
- ✅ Limita permisos del token solo a lo necesario
- ✅ Documenta qué stacks son críticos
- ✅ No uses la API para operaciones destructivas sin confirmación
