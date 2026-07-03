# Control Panel - Service Monitoring & Management

A comprehensive administration panel for monitoring services with automated failure notifications, health checks, and infrastructure management through Portainer integration.

## 🚀 Features

### Core Functionality
- **📧 Email Notifications**: Automated email alerts via configurable SMTP for service failures
- **📝 Notion Integration**: Automatic task creation in Notion databases when services fail
- **💓 Health Checks**: Configurable periodic HTTP/HTTPS health checks with failure detection
- **🐳 Portainer Integration**: View stats and manage Docker stacks (start/stop/restart)
- **🔔 Failure Webhook**: API endpoint for services to report failures
- **📊 Project Management**: Configure multiple projects with individual settings

### Configuration
- Per-project email templates with variable substitution
- Customizable developer email lists per project
- Configurable health check intervals (1min to custom cron)
- Project-specific Notion task properties mapping
- Portainer stack linking and management

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Services      │────────▶│  Failure Webhook │
│  (External)     │         │   (Backend API)  │
└─────────────────┘         └────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │  Email   │    │  Notion  │    │  Logs    │
              │  SMTP    │    │   API    │    │ MongoDB  │
              └──────────┘    └──────────┘    └──────────┘

┌─────────────────┐         ┌──────────────────┐
│  Health Check   │────────▶│   Monitored      │
│   Scheduler     │  HTTP   │    Services      │
└────────┬────────┘         └──────────────────┘
         │ (on failure)
         ▼
   ┌──────────────┐
   │ Notification │
   │   System     │
   └──────────────┘

┌─────────────────┐         ┌──────────────────┐
│  Admin UI       │────────▶│   Portainer      │
│  (React)        │  API    │      API         │
└─────────────────┘         └──────────────────┘
```

### Tech Stack
- **Backend**: Node.js + Fastify + TypeScript + Mongoose
- **Frontend**: React + Vite + TypeScript + shadcn/ui + Tailwind CSS
- **Database**: MongoDB 7
- **Testing**: Vitest
- **Deployment**: Docker + Docker Compose

## 📋 Prerequisites

- **Docker** and **Docker Compose** (for containerized deployment)
- **Node.js 22+** (for local development)
- **MongoDB** (included in docker-compose or external instance)

## 🚦 Quick Start

### Development (Local)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ismola/control-panel.git
   cd control-panel
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Edit the files with your configuration
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/docs
   - MongoDB: mongodb://localhost:27017/control-panel

5. **Login with default admin credentials**
   - Email: `admin@example.com`
   - Password: `admin123`
   - **⚠️ Change these in production via environment variables!**

### Production Deployment

1. **Create environment file**
   ```bash
   cp .env.production.example .env
   # Edit .env with your production values
   ```

2. **Deploy with production compose**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

3. **Or deploy to Portainer**
   - Create new stack in Portainer
   - Paste contents of `docker-compose.production.yml`
   - Add environment variables
   - Deploy

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | `development` | No |
| `PORT` | Backend server port | `8080` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongo:27017/control-panel` | Yes |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | `24h` | No |
| `ADMIN_EMAIL` | Initial admin user email | - | Yes |
| `ADMIN_PASSWORD` | Initial admin user password | - | Yes |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:5173` | No |
| `LOG_LEVEL` | Logging level (trace/debug/info/warn/error) | `info` | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8080` | Yes |
| `VITE_ENV` | Environment name | `development` | No |

### Project Configuration (via UI)

Each project can be configured with:

1. **Email Settings**
   - SMTP host, port, authentication
   - From email address
   - Developer email list
   - Custom email templates with variables

2. **Notion Integration**
   - Integration token
   - Database ID
   - Property mappings (title, description, priority, etc.)

3. **Health Checks**
   - URL to monitor
   - Check interval (1min, 5min, 15min, 30min, 1h, custom)
   - Timeout duration
   - Enable/disable per check

4. **Portainer Integration**
   - API endpoint URL
   - API token
   - Linked stack ID

## 📡 API Usage

### Failure Notification Webhook

Send failure notifications from your services:

```bash
POST /api/notifications/failure
Content-Type: application/json
X-API-Key: your-project-api-key

{
  "serviceName": "payment-service",
  "error": "Database connection timeout",
  "timestamp": "2026-07-03T10:30:00Z",
  "severity": "critical",
  "metadata": {
    "server": "prod-server-01",
    "version": "1.2.3"
  }
}
```

This will:
1. Send emails to all configured developers
2. Create a task in Notion (if configured)
3. Log the notification attempt

### Health Check Integration

Health checks run automatically based on configuration. Manual trigger:

```bash
POST /api/projects/:projectId/health-checks/:checkId/run
Authorization: Bearer <jwt-token>
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Frontend Tests
```bash
cd frontend
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Linting
```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

## 🔧 Development

### Project Structure

```
control-panel/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Fastify server setup
│   │   ├── config/             # Configuration
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Auth, validation
│   │   └── jobs/               # Scheduled tasks
│   ├── test/                   # Test files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx            # App entry point
│   │   ├── App.tsx             # Router setup
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── contexts/           # React contexts
│   │   ├── services/           # API clients
│   │   └── hooks/              # Custom hooks
│   ├── test/                   # Test files
│   └── package.json
├── docker-compose.yml          # Development setup
├── docker-compose.production.yml # Production setup
└── README.md
```

### Adding New Features

1. **Backend**: Add routes in `backend/src/routes/`, services in `backend/src/services/`
2. **Frontend**: Add pages in `frontend/src/pages/`, components in `frontend/src/components/`
3. **Database**: Add models in `backend/src/models/`
4. **Tests**: Add tests alongside implementation files

## 🚀 CI/CD Pipeline

### GitHub Actions Workflows

1. **Test** (`.github/workflows/test.yml`)
   - Runs on PR and push to main
   - Executes lint, tests, and build for backend and frontend
   - Requires all tests to pass

2. **Docker Publish** (`.github/workflows/docker-publish.yml`)
   - Builds Docker images for backend and frontend
   - Pushes to GitHub Container Registry (ghcr.io)
   - Tags: `latest` and `sha-{commit}`

3. **Deploy** (`.github/workflows/deploy.yml`)
   - Triggers on push to main
   - Runs tests → builds images → triggers Portainer webhook
   - Automatic deployment to production

### Setting up GitHub Secrets

Required secrets:
- `PORTAINER_DEPLOY_WEBHOOK`: Webhook URL for Portainer stack update

## 📚 API Documentation

API documentation is available via Swagger UI:
- Development: http://localhost:8080/docs
- Production: https://your-domain.com/docs

## 🔒 Security

- JWT-based authentication with httpOnly cookies
- CORS configuration for allowed origins
- MongoDB connection authentication
- Environment-based secrets (never commit `.env` files)
- Rate limiting on notification endpoints
- Input validation on all API endpoints

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Verify MongoDB is running: `docker ps | grep mongo`
- Check connection string in `.env`
- Ensure MongoDB health check passes

### Backend Won't Start
- Check logs: `docker logs control-panel-backend`
- Verify all required env vars are set
- Ensure MongoDB is healthy before backend starts

### Frontend Can't Connect to Backend
- Check `VITE_API_URL` in frontend `.env`
- Verify backend is running: `curl http://localhost:8080/health`
- Check CORS configuration in backend

### Health Checks Not Running
- Verify health check is enabled in project settings
- Check backend logs for scheduler errors
- Ensure URL is accessible from backend container

### Emails Not Sending
- Verify SMTP settings in project configuration
- Check notification logs in database
- Test SMTP credentials manually

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Fastify for high-performance backend
- shadcn/ui for beautiful UI components
- Notion API for task management integration
- Portainer for Docker stack management

---

**Built with ❤️ for service reliability and monitoring**
