import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware.js';
import { Project } from '../models/Project.js';
import { PortainerService } from '../services/portainer.service.js';

export async function portainerRoutes(fastify: FastifyInstance): Promise<void> {
    // Get all stacks for a project
    fastify.get<{
        Params: { projectId: string };
    }>(
        '/stacks',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const project = await Project.findById(request.params.projectId);
            if (!project) {
                return reply.code(404).send({ error: 'Project not found' });
            }

            if (!project.portainerConfig?.enabled) {
                return reply.code(400).send({ error: 'Portainer is not configured for this project' });
            }

            try {
                const stacks = await PortainerService.getStacks(project.portainerConfig);
                return reply.send(stacks);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return reply.code(500).send({ error: errorMessage });
            }
        }
    );

    // Get single stack
    fastify.get<{
        Params: { projectId: string; stackId: string };
    }>(
        '/stacks/:stackId',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const project = await Project.findById(request.params.projectId);
            if (!project || !project.portainerConfig?.enabled) {
                return reply.code(400).send({ error: 'Portainer is not configured' });
            }

            try {
                const stack = await PortainerService.getStack(
                    project.portainerConfig,
                    request.params.stackId
                );
                return reply.send(stack);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return reply.code(500).send({ error: errorMessage });
            }
        }
    );

    // Get stack stats
    fastify.get<{
        Params: { projectId: string; stackId: string };
    }>(
        '/stacks/:stackId/stats',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const project = await Project.findById(request.params.projectId);
            if (!project || !project.portainerConfig?.enabled) {
                return reply.code(400).send({ error: 'Portainer is not configured' });
            }

            try {
                const stats = await PortainerService.getStackStats(
                    project.portainerConfig,
                    request.params.stackId
                );
                return reply.send(stats);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return reply.code(500).send({ error: errorMessage });
            }
        }
    );

    // Start stack
    fastify.post<{
        Params: { projectId: string; stackId: string };
    }>(
        '/stacks/:stackId/start',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const project = await Project.findById(request.params.projectId);
            if (!project || !project.portainerConfig?.enabled) {
                return reply.code(400).send({ error: 'Portainer is not configured' });
            }

            try {
                await PortainerService.startStack(project.portainerConfig, request.params.stackId);
                return reply.send({ message: 'Stack started successfully' });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return reply.code(500).send({ error: errorMessage });
            }
        }
    );

    // Stop stack
    fastify.post<{
        Params: { projectId: string; stackId: string };
    }>(
        '/stacks/:stackId/stop',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const project = await Project.findById(request.params.projectId);
            if (!project || !project.portainerConfig?.enabled) {
                return reply.code(400).send({ error: 'Portainer is not configured' });
            }

            try {
                await PortainerService.stopStack(project.portainerConfig, request.params.stackId);
                return reply.send({ message: 'Stack stopped successfully' });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return reply.code(500).send({ error: errorMessage });
            }
        }
    );

    // Restart stack
    fastify.post<{
        Params: { projectId: string; stackId: string };
    }>(
        '/stacks/:stackId/restart',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const project = await Project.findById(request.params.projectId);
            if (!project || !project.portainerConfig?.enabled) {
                return reply.code(400).send({ error: 'Portainer is not configured' });
            }

            try {
                await PortainerService.restartStack(project.portainerConfig, request.params.stackId);
                return reply.send({ message: 'Stack restarted successfully' });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return reply.code(500).send({ error: errorMessage });
            }
        }
    );

    // Test Portainer connection
    fastify.post<{
        Body: {
            apiUrl: string;
            apiToken: string;
        };
    }>(
        '/test-connection',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { apiUrl, apiToken } = request.body;

            if (!apiUrl || !apiToken) {
                return reply.code(400).send({ error: 'apiUrl and apiToken are required' });
            }

            const success = await PortainerService.testConnection(apiUrl, apiToken);
            return reply.send({ success });
        }
    );
}
