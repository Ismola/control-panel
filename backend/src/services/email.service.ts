import nodemailer, { Transporter } from 'nodemailer';
import { IEmailConfig } from '../models/Project.js';
import { NotificationLog } from '../models/NotificationLog.js';
import { Types } from 'mongoose';

export class EmailService {
    private static createTransporter(config: IEmailConfig): Transporter {
        return nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            auth: {
                user: config.smtp.auth.user,
                pass: config.smtp.auth.pass,
            },
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
        });
    }

    static async sendEmail(
        projectId: Types.ObjectId,
        config: IEmailConfig,
        to: string[],
        subject: string,
        html: string,
        text: string,
        retries = 3
    ): Promise<void> {
        const transporter = this.createTransporter(config);

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const info = await transporter.sendMail({
                    from: config.from,
                    to: to.join(', '),
                    subject,
                    html,
                    text,
                });

                // Log success
                await NotificationLog.create({
                    projectId,
                    type: 'email',
                    status: 'success',
                    message: `Email sent successfully to ${to.length} recipient(s)`,
                    metadata: {
                        messageId: info.messageId,
                        recipients: to,
                        attempt,
                    },
                });

                console.log(`✅ Email sent successfully (attempt ${attempt}/${retries}):`, info.messageId);
                return;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`❌ Email send failed (attempt ${attempt}/${retries}):`, errorMessage);

                if (attempt === retries) {
                    // Log failure after all retries
                    await NotificationLog.create({
                        projectId,
                        type: 'email',
                        status: 'failed',
                        error: errorMessage,
                        metadata: {
                            recipients: to,
                            attempts: retries,
                        },
                    });

                    throw new Error(`Failed to send email after ${retries} attempts: ${errorMessage}`);
                }

                // Exponential backoff
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    static async testConnection(config: IEmailConfig): Promise<boolean> {
        try {
            const transporter = this.createTransporter(config);
            await transporter.verify();
            return true;
        } catch (error) {
            console.error('SMTP connection test failed:', error);
            return false;
        }
    }
}
