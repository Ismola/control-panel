import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware.js';
import { HealthCheck } from '../models/HealthCheck.js';
import { HealthCheckExecutor } from '../services/health-check-executor.service.js';
import { HealthCheckScheduler } from '../jobs/health-check.job.js';
import { Types } from 'mongoose';

export async function healthCheckRoutes(fastify: FastifyInstance): Promise<void> {
    // Get all health checks for a project
    fastify.get<{
        Params: { projectId: string };
    }>(
        '/',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const healthChecks = await HealthCheck.find({ projectId: request.params.projectId });
            return reply.send(healthChecks);
        }
    );

    // Get single health check
    fastify.get<{
        Params: { projectId: string; id: string };
    }>(
        '/:id',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const healthCheck = await HealthCheck.findOne({
                _id: request.params.id,
                projectId: request.params.projectId,
            });

            if (!healthCheck) {
                return reply.code(404).send({ error: 'Health check not found' });
            }

            return reply.send(healthCheck);
        }
    );

    // Create health check
    fastify.post<{
        Params: { projectId: string };
        Body: {
            name: string;
            url: string;
            interval?: string;
            timeout?: number;
            enabled?: boolean;
        };
    }>(
        '/',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { name, url, interval, timeout, enabled } = request.body;

            if (!name || !url) {
                return reply.code(400).send({ error: 'name and url are required' });
            }

            const healthCheck = new HealthCheck({
                projectId: new Types.ObjectId(request.params.projectId),
                name,
                url,
                interval: interval || '5min',
                timeout: timeout || 10000,
                enabled: enabled !== undefined ? enabled : true,
            });

            await healthCheck.save();

            // Schedule the health check
            HealthCheckScheduler.scheduleCheck(healthCheck._id.toString(), healthCheck.interval);

            return reply.code(201).send(healthCheck);
        }
    );

    // Update health check
    fastify.put<{
        Params: { projectId: string; id: string };
        Body: Partial<{
            name: string;
            url: string;
            interval: string;
            timeout: number;
            enabled: boolean;
        }>;
    }>(
        '/:id',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const healthCheck = await HealthCheck.findOneAndUpdate(
                { _id: request.params.id, projectId: request.params.projectId },
                { $set: request.body },
                { new: true, runValidators: true }
            );

            if (!healthCheck) {
                return reply.code(404).send({ error: 'Health check not found' });
            }

            // Reschedule if interval changed or enabled status changed
            if (request.body.interval || request.body.enabled !== undefined) {
                if (healthCheck.enabled) {
                    HealthCheckScheduler.rescheduleCheck(healthCheck._id.toString(), healthCheck.interval);
                } else {
                    HealthCheckScheduler.cancelCheck(healthCheck._id.toString());
                }
            }

            return reply.send(healthCheck);
        }
    );

    // Delete health check
    fastify.delete<{
        Params: { projectId: string; id: string };
    }>(
        '/:id',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const healthCheck = await HealthCheck.findOneAndDelete({
                _id: request.params.id,
                projectId: request.params.projectId,
            });

            if (!healthCheck) {
                return reply.code(404).send({ error: 'Health check not found' });
            }

            // Cancel scheduled job
            HealthCheckScheduler.cancelCheck(healthCheck._id.toString());

            return reply.code(204).send();
        }
    );

    // Manual health check run
    fastify.post<{
        Params: { projectId: string; id: string };
    }>(
        '/:id/run',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const healthCheck = await HealthCheck.findOne({
                _id: request.params.id,
                projectId: request.params.projectId,
            });

            if (!healthCheck) {
                return reply.code(404).send({ error: 'Health check not found' });
            }

            // Execute health check immediately
            await HealthCheckExecutor.executeCheck(healthCheck._id.toString());

            // Fetch updated status
            const updatedCheck = await HealthCheck.findById(healthCheck._id);

            return reply.send({
                message: 'Health check executed',
                status: updatedCheck?.status,
                lastCheck: updatedCheck?.lastCheck,
            });
        }
    );
}
