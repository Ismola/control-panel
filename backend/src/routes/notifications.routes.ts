import { FastifyInstance } from 'fastify';
import { Project } from '../models/Project.js';
import { NotificationService } from '../services/notification.service.js';

export async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
    // Webhook endpoint for receiving failure notifications
    fastify.post<{
        Body: {
            serviceName: string;
            error: string;
            timestamp: string;
            severity?: string;
            metadata?: Record<string, unknown>;
        };
        Headers: {
            'x-api-key': string;
        };
    }>('/failure', async (request, reply) => {
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            return reply.code(401).send({ error: 'API key is required' });
        }

        // Find project by API key
        const project = await Project.findOne({ apiKey });
        if (!project) {
            return reply.code(401).send({ error: 'Invalid API key' });
        }

        const { serviceName, error, timestamp, severity, metadata } = request.body;

        if (!serviceName || !error) {
            return reply.code(400).send({ error: 'serviceName and error are required' });
        }

        fastify.log.info({
            projectId: project._id,
            serviceName,
            error,
            timestamp,
            severity,
            metadata,
        }, 'Failure notification received');

        // Send notifications asynchronously
        NotificationService.sendFailureNotification(project._id, {
            serviceName,
            error,
            timestamp: timestamp || new Date().toISOString(),
            severity: severity || 'error',
            metadata,
        }).catch((err) => {
            fastify.log.error(err, 'Failed to send notification');
        });

        return reply.code(202).send({
            message: 'Notification received and will be processed',
            projectId: project._id.toString(),
        });
    });
}
