#!/bin/bash

# Control Panel - Integration Tests
# Este script ayuda a configurar y probar todas las integraciones

set -e

API_URL="${API_URL:-http://localhost:8080}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================"
echo "Control Panel - Integration Setup"
echo "========================================${NC}"
echo ""

# Login
echo -e "${YELLOW}Autenticando...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Error al autenticar${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado correctamente${NC}"
echo ""

# Menu
echo -e "${BLUE}Selecciona qué integración quieres configurar:${NC}"
echo "1) 📧 Email (SMTP)"
echo "2) 📝 Notion"
echo "3) 🐳 Portainer"
echo "4) 🎯 Todas las integraciones"
echo "5) 🧪 Solo probar integraciones existentes"
echo ""
read -p "Opción (1-5): " OPTION

case $OPTION in
    1)
        echo -e "\n${BLUE}=== Configuración de Email ===${NC}"
        read -p "SMTP Host (ej: smtp.gmail.com): " SMTP_HOST
        read -p "SMTP Port (ej: 587): " SMTP_PORT
        read -p "SMTP User (ej: tu-email@gmail.com): " SMTP_USER
        read -sp "SMTP Password: " SMTP_PASS
        echo ""
        read -p "From Email (ej: Control Panel <noreply@ejemplo.com>): " FROM_EMAIL
        read -p "Recipients (separados por coma): " RECIPIENTS
        
        RECIPIENTS_JSON=$(echo $RECIPIENTS | jq -R 'split(",") | map(gsub("^\\s+|\\s+$";""))')
        
        PROJECT_DATA='{
            "name": "Proyecto con Email",
            "description": "Configurado con notificaciones email",
            "emailNotifications": {
                "enabled": true,
                "smtpHost": "'$SMTP_HOST'",
                "smtpPort": '$SMTP_PORT',
                "smtpUser": "'$SMTP_USER'",
                "smtpPassword": "'$SMTP_PASS'",
                "from": "'$FROM_EMAIL'",
                "recipients": '$RECIPIENTS_JSON'
            }
        }'
        ;;
        
    2)
        echo -e "\n${BLUE}=== Configuración de Notion ===${NC}"
        echo "Para obtener el Integration Token:"
        echo "1. Ve a https://www.notion.so/my-integrations"
        echo "2. Crea una nueva integración"
        echo "3. Copia el Internal Integration Token"
        echo ""
        read -p "Notion Integration Token (secret_...): " NOTION_TOKEN
        
        echo ""
        echo "Para obtener el Database ID:"
        echo "1. Abre tu base de datos en Notion"
        echo "2. Copia el ID de la URL (32 caracteres entre / y ?)"
        echo ""
        read -p "Notion Database ID: " DATABASE_ID
        
        echo ""
        echo "Mapeo de propiedades (presiona Enter para usar valores por defecto):"
        read -p "Columna para título [Name]: " TITLE_PROP
        TITLE_PROP=${TITLE_PROP:-Name}
        read -p "Columna para descripción [Description]: " DESC_PROP
        DESC_PROP=${DESC_PROP:-Description}
        read -p "Columna para prioridad [Priority]: " PRIORITY_PROP
        PRIORITY_PROP=${PRIORITY_PROP:-Priority}
        read -p "Columna para estado [Status]: " STATUS_PROP
        STATUS_PROP=${STATUS_PROP:-Status}
        
        PROJECT_DATA='{
            "name": "Proyecto con Notion",
            "description": "Configurado con notificaciones Notion",
            "notionNotifications": {
                "enabled": true,
                "integrationToken": "'$NOTION_TOKEN'",
                "databaseId": "'$DATABASE_ID'",
                "propertyMappings": {
                    "title": "'$TITLE_PROP'",
                    "description": "'$DESC_PROP'",
                    "priority": "'$PRIORITY_PROP'",
                    "status": "'$STATUS_PROP'"
                }
            }
        }'
        ;;
        
    3)
        echo -e "\n${BLUE}=== Configuración de Portainer ===${NC}"
        read -p "Portainer URL (ej: https://portainer.tudominio.com): " PORTAINER_URL
        read -p "Portainer API Token (ptr_...): " PORTAINER_TOKEN
        read -p "Endpoint ID [1]: " ENDPOINT_ID
        ENDPOINT_ID=${ENDPOINT_ID:-1}
        
        PROJECT_DATA='{
            "name": "Proyecto con Portainer",
            "description": "Configurado con integración Portainer",
            "portainerConfig": {
                "enabled": true,
                "apiUrl": "'$PORTAINER_URL'",
                "apiToken": "'$PORTAINER_TOKEN'",
                "endpointId": '$ENDPOINT_ID'
            }
        }'
        ;;
        
    4)
        echo -e "\n${BLUE}=== Configuración Completa ===${NC}"
        echo "Vamos a configurar todas las integraciones..."
        
        # Email
        echo -e "\n${YELLOW}📧 Email Configuration${NC}"
        read -p "SMTP Host: " SMTP_HOST
        read -p "SMTP Port: " SMTP_PORT
        read -p "SMTP User: " SMTP_USER
        read -sp "SMTP Password: " SMTP_PASS
        echo ""
        read -p "From Email: " FROM_EMAIL
        read -p "Recipients (comma separated): " RECIPIENTS
        RECIPIENTS_JSON=$(echo $RECIPIENTS | jq -R 'split(",") | map(gsub("^\\s+|\\s+$";""))')
        
        # Notion
        echo -e "\n${YELLOW}📝 Notion Configuration${NC}"
        read -p "Notion Integration Token: " NOTION_TOKEN
        read -p "Notion Database ID: " DATABASE_ID
        
        # Portainer
        echo -e "\n${YELLOW}🐳 Portainer Configuration${NC}"
        read -p "Portainer URL: " PORTAINER_URL
        read -p "Portainer API Token: " PORTAINER_TOKEN
        read -p "Endpoint ID [1]: " ENDPOINT_ID
        ENDPOINT_ID=${ENDPOINT_ID:-1}
        
        PROJECT_DATA='{
            "name": "Proyecto Completo",
            "description": "Con todas las integraciones configuradas",
            "emailNotifications": {
                "enabled": true,
                "smtpHost": "'$SMTP_HOST'",
                "smtpPort": '$SMTP_PORT',
                "smtpUser": "'$SMTP_USER'",
                "smtpPassword": "'$SMTP_PASS'",
                "from": "'$FROM_EMAIL'",
                "recipients": '$RECIPIENTS_JSON'
            },
            "notionNotifications": {
                "enabled": true,
                "integrationToken": "'$NOTION_TOKEN'",
                "databaseId": "'$DATABASE_ID'",
                "propertyMappings": {
                    "title": "Name",
                    "description": "Description",
                    "priority": "Priority",
                    "status": "Status"
                }
            },
            "portainerConfig": {
                "enabled": true,
                "apiUrl": "'$PORTAINER_URL'",
                "apiToken": "'$PORTAINER_TOKEN'",
                "endpointId": '$ENDPOINT_ID'
            }
        }'
        ;;
        
    5)
        echo -e "\n${BLUE}=== Probar Integraciones Existentes ===${NC}"
        
        # Listar proyectos
        PROJECTS=$(curl -s "$API_URL/api/projects" -H "Authorization: Bearer $TOKEN")
        
        echo "Proyectos disponibles:"
        echo "$PROJECTS" | jq -r '.[] | "\(.name) (ID: \(._id))"'
        echo ""
        
        read -p "ID del proyecto a probar: " PROJECT_ID
        
        # Obtener proyecto
        PROJECT=$(curl -s "$API_URL/api/projects/$PROJECT_ID" -H "Authorization: Bearer $TOKEN")
        API_KEY=$(echo "$PROJECT" | jq -r '.apiKey')
        
        echo -e "\n${YELLOW}Enviando notificación de prueba...${NC}"
        
        TEST_RESPONSE=$(curl -s -X POST "$API_URL/api/notifications/failure" \
            -H "Content-Type: application/json" \
            -H "X-API-Key: $API_KEY" \
            -d '{
                "serviceName": "Test Service",
                "error": "Esta es una notificación de prueba generada por el script de integración",
                "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
                "severity": "critical",
                "metadata": {
                    "test": true,
                    "source": "integration-test-script"
                }
            }')
        
        echo "$TEST_RESPONSE" | jq .
        
        echo -e "\n${GREEN}✅ Notificación enviada${NC}"
        echo -e "${BLUE}Verifica:${NC}"
        echo "- Tu bandeja de email (si email está configurado)"
        echo "- Tu base de datos de Notion (si Notion está configurado)"
        echo ""
        
        exit 0
        ;;
        
    *)
        echo -e "${RED}Opción inválida${NC}"
        exit 1
        ;;
esac

# Crear proyecto
echo -e "\n${YELLOW}Creando proyecto...${NC}"
PROJECT_RESPONSE=$(curl -s -X POST "$API_URL/api/projects" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$PROJECT_DATA")

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '._id')
API_KEY=$(echo "$PROJECT_RESPONSE" | jq -r '.apiKey')

if [ "$PROJECT_ID" == "null" ] || [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error al crear proyecto${NC}"
    echo "$PROJECT_RESPONSE" | jq .
    exit 1
fi

echo -e "${GREEN}✅ Proyecto creado exitosamente${NC}"
echo "Project ID: $PROJECT_ID"
echo "API Key: $API_KEY"
echo ""

# Preguntar si quiere crear health check
read -p "¿Quieres crear un health check? (y/n): " CREATE_HC

if [ "$CREATE_HC" == "y" ] || [ "$CREATE_HC" == "Y" ]; then
    echo -e "\n${BLUE}=== Configuración de Health Check ===${NC}"
    read -p "URL a monitorear: " HC_URL
    read -p "Nombre del check: " HC_NAME
    read -p "Intervalo en cron (*/5 * * * * = cada 5 min) [*/5 * * * *]: " HC_INTERVAL
    HC_INTERVAL=${HC_INTERVAL:-"*/5 * * * *"}
    
    HC_RESPONSE=$(curl -s -X POST "$API_URL/api/projects/$PROJECT_ID/health-checks" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "name": "'$HC_NAME'",
            "url": "'$HC_URL'",
            "interval": "'$HC_INTERVAL'",
            "timeout": 5000,
            "enabled": true
        }')
    
    echo -e "${GREEN}✅ Health check creado${NC}"
    echo "$HC_RESPONSE" | jq .
fi

# Enviar notificación de prueba
echo -e "\n${BLUE}=== Prueba de Notificación ===${NC}"
read -p "¿Quieres enviar una notificación de prueba? (y/n): " SEND_TEST

if [ "$SEND_TEST" == "y" ] || [ "$SEND_TEST" == "Y" ]; then
    echo -e "\n${YELLOW}Enviando notificación de prueba...${NC}"
    
    TEST_RESPONSE=$(curl -s -X POST "$API_URL/api/notifications/failure" \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $API_KEY" \
        -d '{
            "serviceName": "Test Service",
            "error": "Esta es una notificación de prueba para verificar la configuración",
            "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
            "severity": "critical",
            "metadata": {
                "test": true,
                "configuredBy": "integration-setup-script"
            }
        }')
    
    echo "$TEST_RESPONSE" | jq .
    
    echo -e "\n${GREEN}✅ Notificación enviada${NC}"
    echo -e "${BLUE}Verifica:${NC}"
    echo "- Tu bandeja de email (si configuraste email)"
    echo "- Tu base de datos de Notion (si configuraste Notion)"
    echo ""
fi

# Resumen
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 ¡Configuración Completa!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Project ID: $PROJECT_ID"
echo "API Key: $API_KEY"
echo ""
echo "Puedes usar este API Key para enviar notificaciones desde tus servicios:"
echo ""
echo -e "${YELLOW}curl -X POST $API_URL/api/notifications/failure \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'X-API-Key: $API_KEY' \\"
echo "  -d '{"
echo '    "serviceName": "Mi Servicio",'
echo '    "error": "Descripción del error",'
echo '    "timestamp": "2026-07-03T10:00:00Z",'
echo '    "severity": "critical"'
echo "  }'${NC}"
echo ""
echo "Para más información, consulta docs/INTEGRATIONS.md"
