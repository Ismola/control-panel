import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware.js';
import { Project } from '../models/Project.js';
import { randomBytes } from 'crypto';

export async function projectRoutes(fastify: FastifyInstance): Promise<void> {
    // Get all projects
    fastify.get(
        '/',
        {
            onRequest: [authenticate],
        },
        async (_request, reply) => {
            const projects = await Project.find().select('-emailConfig.smtp.auth.pass -notionConfig.integrationToken -portainerConfig.apiToken');
            return reply.send(projects);
        }
    );

    // Get single project
    fastify.get<{
        Params: { id: string };
    }>(
        '/:id',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const project = await Project.findById(request.params.id).select('-emailConfig.smtp.auth.pass -notionConfig.integrationToken -portainerConfig.apiToken');
            if (!project) {
                return reply.code(404).send({ error: 'Project not found' });
            }
            return reply.send(project);
        }
    );

    // Create project
    fastify.post<{
        Body: { name: string; description?: string };
    }>(
        '/',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { name, description } = request.body;

            if (!name) {
                return reply.code(400).send({ error: 'Name is required' });
            }

            // Generate API key
            const apiKey = `cp_${randomBytes(32).toString('hex')}`;

            const project = new Project({
                name,
                description,
                apiKey,
            });

            await project.save();
            return reply.code(201).send(project);
        }
    );

    // Update project
    fastify.put<{
        Params: { id: string };
        Body: Partial<{
            name: string;
            description: string;
            emailConfig: unknown;
            notionConfig: unknown;
            portainerConfig: unknown;
        }>;
    }>(
        '/:id',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const project = await Project.findByIdAndUpdate(
                request.params.id,
                { $set: request.body },
                { new: true, runValidators: true }
            );

            if (!project) {
                return reply.code(404).send({ error: 'Project not found' });
            }

            return reply.send(project);
        }
    );

    // Delete project
    fastify.delete<{
        Params: { id: string };
    }>(
        '/:id',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const project = await Project.findByIdAndDelete(request.params.id);
            if (!project) {
                return reply.code(404).send({ error: 'Project not found' });
            }
            return reply.code(204).send();
        }
    );

    // Regenerate API key
    fastify.post<{
        Params: { id: string };
    }>(
        '/:id/regenerate-key',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const apiKey = `cp_${randomBytes(32).toString('hex')}`;
            const project = await Project.findByIdAndUpdate(
                request.params.id,
                { apiKey },
                { new: true }
            );

            if (!project) {
                return reply.code(404).send({ error: 'Project not found' });
            }

            return reply.send({ apiKey: project.apiKey });
        }
    );
}
