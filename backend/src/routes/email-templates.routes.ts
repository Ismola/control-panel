import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware.js';
import { EmailTemplate } from '../models/EmailTemplate.js';
import { TemplateService } from '../services/template.service.js';
import { Types } from 'mongoose';

export async function emailTemplateRoutes(fastify: FastifyInstance): Promise<void> {
    // Get all email templates for a project
    fastify.get<{
        Params: { projectId: string };
    }>(
        '/',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const templates = await EmailTemplate.find({ projectId: request.params.projectId });
            return reply.send(templates);
        }
    );

    // Get single email template
    fastify.get<{
        Params: { projectId: string; id: string };
    }>(
        '/:id',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const template = await EmailTemplate.findOne({
                _id: request.params.id,
                projectId: request.params.projectId,
            });

            if (!template) {
                return reply.code(404).send({ error: 'Email template not found' });
            }

            return reply.send(template);
        }
    );

    // Create email template
    fastify.post<{
        Params: { projectId: string };
        Body: {
            name: string;
            subject: string;
            htmlBody: string;
            textBody: string;
            isDefault?: boolean;
        };
    }>(
        '/',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { name, subject, htmlBody, textBody, isDefault } = request.body;

            if (!name || !subject || !htmlBody || !textBody) {
                return reply.code(400).send({ error: 'name, subject, htmlBody, and textBody are required' });
            }

            // Validate templates
            const subjectValidation = TemplateService.validateTemplate(subject);
            const htmlValidation = TemplateService.validateTemplate(htmlBody);
            const textValidation = TemplateService.validateTemplate(textBody);

            if (!subjectValidation.valid || !htmlValidation.valid || !textValidation.valid) {
                return reply.code(400).send({
                    error: 'Template validation failed',
                    details: {
                        subject: subjectValidation.errors,
                        htmlBody: htmlValidation.errors,
                        textBody: textValidation.errors,
                    },
                });
            }

            // If setting as default, unset other defaults
            if (isDefault) {
                await EmailTemplate.updateMany(
                    { projectId: request.params.projectId, isDefault: true },
                    { isDefault: false }
                );
            }

            const template = new EmailTemplate({
                projectId: new Types.ObjectId(request.params.projectId),
                name,
                subject,
                htmlBody,
                textBody,
                isDefault: isDefault || false,
            });

            await template.save();
            return reply.code(201).send(template);
        }
    );

    // Update email template
    fastify.put<{
        Params: { projectId: string; id: string };
        Body: Partial<{
            name: string;
            subject: string;
            htmlBody: string;
            textBody: string;
            isDefault: boolean;
        }>;
    }>(
        '/:id',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            // Validate templates if provided
            if (request.body.subject) {
                const validation = TemplateService.validateTemplate(request.body.subject);
                if (!validation.valid) {
                    return reply.code(400).send({
                        error: 'Subject validation failed',
                        details: validation.errors,
                    });
                }
            }

            if (request.body.htmlBody) {
                const validation = TemplateService.validateTemplate(request.body.htmlBody);
                if (!validation.valid) {
                    return reply.code(400).send({
                        error: 'HTML body validation failed',
                        details: validation.errors,
                    });
                }
            }

            if (request.body.textBody) {
                const validation = TemplateService.validateTemplate(request.body.textBody);
                if (!validation.valid) {
                    return reply.code(400).send({
                        error: 'Text body validation failed',
                        details: validation.errors,
                    });
                }
            }

            // If setting as default, unset other defaults
            if (request.body.isDefault) {
                await EmailTemplate.updateMany(
                    { projectId: request.params.projectId, isDefault: true },
                    { isDefault: false }
                );
            }

            const template = await EmailTemplate.findOneAndUpdate(
                { _id: request.params.id, projectId: request.params.projectId },
                { $set: request.body },
                { new: true, runValidators: true }
            );

            if (!template) {
                return reply.code(404).send({ error: 'Email template not found' });
            }

            return reply.send(template);
        }
    );

    // Delete email template
    fastify.delete<{
        Params: { projectId: string; id: string };
    }>(
        '/:id',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const template = await EmailTemplate.findOneAndDelete({
                _id: request.params.id,
                projectId: request.params.projectId,
            });

            if (!template) {
                return reply.code(404).send({ error: 'Email template not found' });
            }

            return reply.code(204).send();
        }
    );

    // Preview email template
    fastify.post<{
        Params: { projectId: string };
        Body: {
            subject: string;
            htmlBody: string;
            textBody: string;
            variables?: Record<string, unknown>;
        };
    }>(
        '/preview',
        {
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { subject, htmlBody, textBody, variables } = request.body;

            const sampleVariables: any = variables || {
                serviceName: 'example-service',
                error: 'Connection timeout',
                timestamp: new Date().toISOString(),
                severity: 'critical',
                metadata: { server: 'prod-01', version: '1.0.0' },
            };

            const renderedSubject = TemplateService.renderTemplate(subject, sampleVariables);
            const renderedHtml = TemplateService.renderTemplate(htmlBody, sampleVariables);
            const renderedText = TemplateService.renderTemplate(textBody, sampleVariables);

            return reply.send({
                subject: renderedSubject,
                htmlBody: renderedHtml,
                textBody: renderedText,
            });
        }
    );

    // Get default template
    fastify.get('/default', async (_request, reply) => {
        const defaultTemplate = TemplateService.getDefaultTemplate();
        return reply.send(defaultTemplate);
    });
}
