# Ejemplos de Configuración de Proyectos

Este directorio contiene ejemplos de configuración para diferentes escenarios de uso del Control Panel.

## 📁 Archivos de Ejemplo

### 1. `project-with-email.json`
Proyecto configurado solo con notificaciones por email.

### 2. `project-with-notion.json`
Proyecto configurado solo con notificaciones en Notion.

### 3. `project-with-portainer.json`
Proyecto configurado solo con integración de Portainer.

### 4. `project-complete.json`
Proyecto con todas las integraciones configuradas.

### 5. `health-check-examples.json`
Ejemplos de diferentes configuraciones de health checks.

### 6. `email-template-examples.json`
Ejemplos de templates de email personalizados.

## 🚀 Uso

### Crear un proyecto desde un ejemplo

```bash
# Obtener token de autenticación
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r .token)

# Crear proyecto desde ejemplo
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @docs/examples/project-with-email.json

# O editar el archivo y luego usarlo
cat docs/examples/project-with-email.json | \
  jq '.emailNotifications.smtpUser = "tu-email@gmail.com"' | \
  curl -X POST http://localhost:8080/api/projects \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d @-
```

## 📝 Personalización

Edita los archivos JSON según tus necesidades:

1. Reemplaza los valores de ejemplo con tus credenciales reales
2. Ajusta las configuraciones según tus requisitos
3. Usa los archivos como plantillas para tus proyectos

## ⚠️ Seguridad

**NUNCA** commitees archivos de configuración con credenciales reales al repositorio.
Usa estos archivos solo como plantillas.
