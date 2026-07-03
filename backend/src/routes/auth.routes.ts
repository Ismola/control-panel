import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.middleware.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
    // Login endpoint
    fastify.post<{
        Body: { email: string; password: string };
    }>('/login', async (request, reply) => {
        const { email, password } = request.body;

        if (!email || !password) {
            return reply.code(400).send({ error: 'Email and password are required' });
        }

        const user = await AuthService.validateUser(email, password);
        if (!user) {
            return reply.code(401).send({ error: 'Invalid credentials' });
        }

        const token = fastify.jwt.sign({
            id: user._id.toString(),
            email: user.email,
        });

        return reply.send({
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
            },
        });
    });

    // Get current user
    fastify.get(
        '/me',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const userPayload = request.user as { id: string; email: string };
            const user = await AuthService.findUserByEmail(userPayload.email);
            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }

            return reply.send({
                id: user._id.toString(),
                email: user.email,
            });
        }
    );
}
