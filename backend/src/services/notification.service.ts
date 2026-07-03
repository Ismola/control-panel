import { Project } from '../models/Project.js';
import { EmailTemplate } from '../models/EmailTemplate.js';
import { EmailService } from './email.service.js';
import { NotionService } from './notion.service.js';
import { TemplateService, TemplateVariables } from './template.service.js';
import { Types } from 'mongoose';

export class NotificationService {
    static async sendFailureNotification(
        projectId: Types.ObjectId,
        variables: TemplateVariables
    ): Promise<void> {
        const project = await Project.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        const notifications: Promise<void>[] = [];

        // Send email notification
        if (project.emailConfig && project.emailConfig.developers.length > 0) {
            notifications.push(this.sendEmailNotification(project, variables));
        }

        // Create Notion task
        if (project.notionConfig?.enabled) {
            notifications.push(this.createNotionTask(project, variables));
        }

        // Execute all notifications in parallel
        await Promise.allSettled(notifications);
    }

    private static async sendEmailNotification(
        project: { _id: Types.ObjectId; emailConfig?: unknown },
        variables: TemplateVariables
    ): Promise<void> {
        const emailConfig = project.emailConfig as {
            smtp: { host: string; port: number; secure: boolean; auth: { user: string; pass: string } };
            from: string;
            developers: string[];
        };

        if (!emailConfig) {
            throw new Error('Email config not found');
        }

        // Get email template (default or custom)
        let template = await EmailTemplate.findOne({
            projectId: project._id,
            isDefault: true,
        });

        if (!template) {
            // Use default template
            const defaultTemplate = TemplateService.getDefaultTemplate();
            template = {
                subject: defaultTemplate.subject,
                htmlBody: defaultTemplate.htmlBody,
                textBody: defaultTemplate.textBody,
            } as never;
        }

        // Render template with variables
        const subject = TemplateService.renderTemplate(template.subject, variables);
        const htmlBody = TemplateService.renderTemplate(template.htmlBody, variables);
        const textBody = TemplateService.renderTemplate(template.textBody, variables);

        // Send email
        await EmailService.sendEmail(
            project._id,
            emailConfig,
            emailConfig.developers,
            subject,
            htmlBody,
            textBody
        );
    }

    private static async createNotionTask(
        project: { _id: Types.ObjectId; notionConfig?: unknown },
        variables: TemplateVariables
    ): Promise<void> {
        const notionConfig = project.notionConfig as {
            enabled: boolean;
            integrationToken: string;
            databaseId: string;
            propertyMappings?: Record<string, string>;
        };

        if (!notionConfig?.enabled) {
            return;
        }

        const taskProperties = {
            title: `[${variables.severity || 'ERROR'}] ${variables.serviceName} - ${variables.error}`,
            description: `Error: ${variables.error}\nTimestamp: ${variables.timestamp}`,
            priority: variables.severity === 'critical' ? 'High' : 'Medium',
            status: 'To Do',
        };

        await NotionService.createTask(project._id, notionConfig, taskProperties);
    }
}
