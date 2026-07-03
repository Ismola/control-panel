import { FastifyRequest, FastifyReply } from 'fastify';

export interface AuthenticatedRequest extends FastifyRequest {
    user: {
        id: string;
        email: string;
    };
}

export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        await request.jwtVerify();
    } catch (error) {
        reply.code(401).send({ error: 'Unauthorized' });
    }
}
