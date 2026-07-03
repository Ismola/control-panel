import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { AuthService } from './services/auth.service.js';
import { authRoutes } from './routes/auth.routes.js';
import { projectRoutes } from './routes/projects.routes.js';
import { notificationRoutes } from './routes/notifications.routes.js';
import { healthCheckRoutes } from './routes/health-checks.routes.js';
import { emailTemplateRoutes } from './routes/email-templates.routes.js';
import { portainerRoutes } from './routes/portainer.routes.js';
import { HealthCheckScheduler } from './jobs/health-check.job.js';

const fastify = Fastify({
    logger: {
        level: config.logLevel,
        transport:
            config.env === 'development'
                ? {
                    target: 'pino-pretty',
                    options: {
                        translateTime: 'HH:MM:ss Z',
                        ignore: 'pid,hostname',
                    },
                }
                : undefined,
    },
});

// Register plugins
await fastify.register(cors, {
    origin: config.cors.origin,
    credentials: true,
});

await fastify.register(jwt, {
    secret: config.jwt.secret,
});

// Swagger documentation
await fastify.register(swagger, {
    openapi: {
        info: {
            title: 'Control Panel API',
            description: 'Service monitoring and management API',
            version: '1.0.0',
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
});

await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
    },
});

// Health check endpoint
fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(projectRoutes, { prefix: '/api/projects' });
await fastify.register(notificationRoutes, { prefix: '/api/notifications' });

// Health check routes (nested under projects)
fastify.register(async (instance) => {
    instance.register(healthCheckRoutes, { prefix: '/:projectId/health-checks' });
    instance.register(emailTemplateRoutes, { prefix: '/:projectId/email-templates' });
    instance.register(portainerRoutes, { prefix: '/:projectId/portainer' });
}, { prefix: '/api/projects' });

// Start server
const start = async (): Promise<void> => {
    try {
        // Connect to database
        await connectDatabase();

        // Initialize admin user
        await AuthService.initializeAdminUser(config.admin.email, config.admin.password);

        // Start health check scheduler
        await HealthCheckScheduler.start();

        // Start server
        await fastify.listen({ port: config.port, host: config.host });
        fastify.log.info(`🚀 Server running at http://${config.host}:${config.port}`);
        fastify.log.info(`📚 API Documentation at http://${config.host}:${config.port}/docs`);
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
