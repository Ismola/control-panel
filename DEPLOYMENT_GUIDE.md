# Deployment Guide

This guide covers deploying the Control Panel to various environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Development Deployment](#development-deployment)
- [Production Deployment](#production-deployment)
- [Portainer Deployment](#portainer-deployment)
- [Manual Deployment](#manual-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required
- Docker 20.10+
- Docker Compose 2.0+
- Access to a MongoDB instance (or use the provided docker-compose service)

### For CI/CD
- GitHub account with repository access
- GitHub Container Registry (GHCR) enabled
- GitHub Actions enabled on repository

### For Production
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)
- SMTP server credentials (for email notifications)
- Notion integration token (if using Notion)
- Portainer instance (if managing Docker stacks)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/control-panel.git
cd control-panel
```

### 2. Configure Backend Environment

Copy and edit the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```bash
# Backend Configuration
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://mongo:27017/control-panel

# JWT Configuration - IMPORTANT: Use a strong secret!
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d

# Admin User (created on first startup)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=ChangeThisToASecurePassword123!

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Optional: SMTP (can also be configured per-project via UI)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notifications@yourdomain.com
SMTP_PASSWORD=your-smtp-password
```

### 3. Configure Frontend Environment

Copy and edit the frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```bash
# Frontend Configuration
VITE_API_URL=https://api.yourdomain.com
# Or for same-domain deployment:
# VITE_API_URL=https://yourdomain.com/api
```

## Development Deployment

### Using Docker Compose (Recommended)

The easiest way to run the application locally:

```bash
# Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (database data)
docker-compose down -v
```

Access the application:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- API Docs: http://localhost:8080/docs

### Manual Development Setup

If you prefer running without Docker:

**Terminal 1 - MongoDB:**
```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

**Terminal 2 - Backend:**
```bash
cd backend
npm install
npm run dev  # Runs with tsx watch for hot reload
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
npm run dev  # Runs Vite dev server with HMR
```

## Production Deployment

### Option 1: Docker Compose Production

1. **Build and push images** (or use CI/CD):

```bash
# Build backend
docker build -t ghcr.io/your-org/control-panel-backend:latest ./backend

# Build frontend
docker build -t ghcr.io/your-org/control-panel-frontend:latest ./frontend

# Push to GHCR
docker push ghcr.io/your-org/control-panel-backend:latest
docker push ghcr.io/your-org/control-panel-frontend:latest
```

2. **Create production environment file:**

```bash
cp .env.production.example .env
```

Edit `.env` with your values:

```bash
# MongoDB
MONGODB_URI=mongodb://mongo:27017/control-panel

# JWT
JWT_SECRET=your-production-jwt-secret-at-least-32-characters
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecureProductionPassword123!

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

3. **Deploy:**

```bash
docker-compose -f docker-compose.production.yml up -d
```

### Option 2: Separate Service Deployment

You can deploy backend and frontend to different hosts:

**Backend Server:**
```bash
docker run -d \
  --name control-panel-backend \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://your-mongodb-host:27017/control-panel \
  -e JWT_SECRET=your-secret \
  -e ADMIN_EMAIL=admin@example.com \
  -e ADMIN_PASSWORD=password \
  ghcr.io/your-org/control-panel-backend:latest
```

**Frontend Server:**
```bash
docker run -d \
  --name control-panel-frontend \
  -p 80:80 \
  -e VITE_API_URL=https://api.yourdomain.com \
  ghcr.io/your-org/control-panel-frontend:latest
```

## Portainer Deployment

### Using Portainer Stacks

1. **Login to Portainer** and navigate to Stacks

2. **Create New Stack** with the following configuration:

3. **Copy docker-compose.production.yml** content into the stack editor

4. **Set Environment Variables** in Portainer:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `VITE_API_URL`

5. **Deploy the Stack**

6. **Configure Reverse Proxy** (if using one):

Example nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API Documentation
    location /docs {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## CI/CD with GitHub Actions

The project includes a GitHub Actions workflow that:
1. Runs tests on backend and frontend
2. Builds Docker images
3. Pushes to GitHub Container Registry (GHCR)

### Setup

1. **Enable GitHub Packages** on your repository

2. **No secrets needed** - GitHub Actions automatically provides `GITHUB_TOKEN`

3. **Configure frontend API URL secret** (optional):
   - Go to Settings → Secrets → Actions
   - Add `VITE_API_URL` with your production API URL

4. **Push to main branch** to trigger the workflow:

```bash
git push origin main
```

5. **Images will be available at:**
   - `ghcr.io/your-org/control-panel-backend:latest`
   - `ghcr.io/your-org/control-panel-frontend:latest`

## Post-Deployment

### 1. Verify Services

```bash
# Check if backend is running
curl http://localhost:8080/health

# Expected response:
# {"status":"ok","timestamp":"2025-01-XX..."}
```

### 2. Initial Login

- Navigate to your frontend URL
- Login with the admin credentials from your `.env` file
- **Immediately create a new admin and delete/change the default one**

### 3. Create Your First Project

1. Go to "Projects" page
2. Click "New Project"
3. Fill in project details
4. Configure email settings (SMTP)
5. (Optional) Configure Notion integration
6. (Optional) Configure Portainer integration
7. Add health checks

### 4. Test Notifications

Use the project's API key to test failure notifications:

```bash
curl -X POST https://yourdomain.com/api/notifications/failure \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_PROJECT_API_KEY" \
  -d '{
    "serviceName": "Test Service",
    "error": "This is a test failure",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "severity": "warning",
    "metadata": {"test": true}
  }'
```

## Security Considerations

### Production Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (use reverse proxy like nginx/traefik)
- [ ] Configure CORS_ORIGIN to your domain only
- [ ] Use environment variables, not hardcoded secrets
- [ ] Restrict MongoDB access (firewall rules)
- [ ] Enable MongoDB authentication in production
- [ ] Regular backups of MongoDB data
- [ ] Monitor logs for suspicious activity
- [ ] Keep Docker images updated

### HTTPS Setup

Use a reverse proxy like nginx or Traefik with Let's Encrypt:

**Example with Traefik:**
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.control-panel.rule=Host(`yourdomain.com`)"
  - "traefik.http.routers.control-panel.entrypoints=websecure"
  - "traefik.http.routers.control-panel.tls.certresolver=letsencrypt"
```

## Backup and Recovery

### Backup MongoDB

```bash
# Create backup
docker exec mongo mongodump --out /backup

# Copy backup to host
docker cp mongo:/backup ./mongodb-backup-$(date +%Y%m%d)

# Restore from backup
docker exec -i mongo mongorestore /backup
```

### Automated Backups

Add to crontab:
```bash
0 2 * * * docker exec mongo mongodump --out /backup && docker cp mongo:/backup ~/backups/control-panel-$(date +\%Y\%m\%d)
```

## Monitoring

### Health Checks

Monitor these endpoints:
- Backend: `http://localhost:8080/health`
- Frontend: `http://localhost:5173` (check if loads)

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Resource Usage

```bash
# Check container resources
docker stats
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. MongoDB not accessible - verify MONGODB_URI
# 2. Port 8080 already in use - change PORT in .env
# 3. Missing environment variables - check .env file
```

### Frontend can't connect to backend

```bash
# Verify VITE_API_URL is correct
# Check CORS settings in backend
# Ensure backend is accessible from browser

# Test backend from frontend container
docker-compose exec frontend curl http://backend:8080/health
```

### MongoDB connection issues

```bash
# Check if MongoDB is running
docker-compose ps mongo

# Test connection
docker-compose exec backend mongosh $MONGODB_URI

# Reset MongoDB
docker-compose down -v
docker-compose up -d mongo
```

### Health checks not running

```bash
# Check backend logs for scheduler errors
docker-compose logs backend | grep -i health

# Verify health checks are enabled in database
# Check if URLs are accessible from backend container
```

## Scaling Considerations

For high-traffic deployments:

1. **Use external MongoDB** (MongoDB Atlas, managed service)
2. **Scale backend horizontally** (multiple instances behind load balancer)
3. **Use Redis for session storage** (if implementing sessions)
4. **Implement rate limiting** (per API key)
5. **Use CDN for frontend** static assets
6. **Enable MongoDB replica set** for high availability

## Support

For issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs with `docker-compose logs`
3. Open an issue on GitHub
4. Check existing documentation in README.md and FRONTEND_IMPLEMENTATION.md

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
