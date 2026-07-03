#!/bin/bash

# Control Panel - API Test Script
# Este script ejecuta pruebas básicas de la API

set -e

API_URL="${API_URL:-http://localhost:8080}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

echo "========================================"
echo "Control Panel - API Tests"
echo "========================================"
echo "API URL: $API_URL"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Health Check
echo "Test 1: Health Check"
HEALTH_RESPONSE=$(curl -s "$API_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    test_result 0 "Health check endpoint"
else
    test_result 1 "Health check endpoint"
    echo "Response: $HEALTH_RESPONSE"
fi
echo ""

# Test 2: Login
echo "Test 2: User Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
    test_result 0 "User login"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
    echo "Token obtained: ${TOKEN:0:50}..."
else
    test_result 1 "User login"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Get Current User
echo "Test 3: Get Current User"
USER_RESPONSE=$(curl -s "$API_URL/auth/me" \
    -H "Authorization: Bearer $TOKEN")

if echo "$USER_RESPONSE" | grep -q '"email"'; then
    test_result 0 "Get current user"
    echo "User: $(echo $USER_RESPONSE | jq -r '.email')"
else
    test_result 1 "Get current user"
    echo "Response: $USER_RESPONSE"
fi
echo ""

# Test 4: List Projects
echo "Test 4: List Projects"
PROJECTS_RESPONSE=$(curl -s "$API_URL/api/projects" \
    -H "Authorization: Bearer $TOKEN")

if echo "$PROJECTS_RESPONSE" | grep -q '\['; then
    test_result 0 "List projects"
    PROJECT_COUNT=$(echo "$PROJECTS_RESPONSE" | jq '. | length')
    echo "Projects found: $PROJECT_COUNT"
else
    test_result 1 "List projects"
    echo "Response: $PROJECTS_RESPONSE"
fi
echo ""

# Test 5: Create Project
echo "Test 5: Create Project"
CREATE_PROJECT_RESPONSE=$(curl -s -X POST "$API_URL/api/projects" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Project '$(date +%s)'",
        "description": "Automated test project",
        "emailNotifications": {
            "enabled": true,
            "smtpHost": "smtp.example.com",
            "smtpPort": 587,
            "smtpUser": "test@example.com",
            "smtpPassword": "password",
            "from": "noreply@example.com",
            "recipients": ["dev@example.com"]
        },
        "notionNotifications": {
            "enabled": false
        },
        "portainerConfig": {
            "enabled": false
        }
    }')

if echo "$CREATE_PROJECT_RESPONSE" | grep -q '"apiKey"'; then
    test_result 0 "Create project"
    PROJECT_ID=$(echo "$CREATE_PROJECT_RESPONSE" | jq -r '._id')
    API_KEY=$(echo "$CREATE_PROJECT_RESPONSE" | jq -r '.apiKey')
    echo "Project created with ID: $PROJECT_ID"
    echo "API Key: ${API_KEY:0:50}..."
else
    test_result 1 "Create project"
    echo "Response: $CREATE_PROJECT_RESPONSE"
fi
echo ""

# Test 6: Get Project by ID
if [ ! -z "$PROJECT_ID" ]; then
    echo "Test 6: Get Project by ID"
    GET_PROJECT_RESPONSE=$(curl -s "$API_URL/api/projects/$PROJECT_ID" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$GET_PROJECT_RESPONSE" | grep -q '"name"'; then
        test_result 0 "Get project by ID"
        echo "Project name: $(echo $GET_PROJECT_RESPONSE | jq -r '.name')"
    else
        test_result 1 "Get project by ID"
        echo "Response: $GET_PROJECT_RESPONSE"
    fi
    echo ""
fi

# Test 7: Delete Project
if [ ! -z "$PROJECT_ID" ]; then
    echo "Test 7: Delete Project"
    DELETE_PROJECT_RESPONSE=$(curl -s -X DELETE "$API_URL/api/projects/$PROJECT_ID" \
        -H "Authorization: Bearer $TOKEN")
    
    if echo "$DELETE_PROJECT_RESPONSE" | grep -q '"message"'; then
        test_result 0 "Delete project"
    else
        test_result 1 "Delete project"
        echo "Response: $DELETE_PROJECT_RESPONSE"
    fi
    echo ""
fi

# Test 8: Swagger Documentation
echo "Test 8: Swagger Documentation"
DOCS_RESPONSE=$(curl -s "$API_URL/docs")

if echo "$DOCS_RESPONSE" | grep -q 'Swagger UI'; then
    test_result 0 "Swagger documentation available"
else
    test_result 1 "Swagger documentation available"
fi
echo ""

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✅${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed! ❌${NC}"
    exit 1
fi
