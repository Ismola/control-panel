import nodemailer from "nodemailer";
import { renderTemplate } from "./template.js";

interface EmailConfig {
    enabled?: boolean;
    smtpHost?: string | null;
    smtpPort?: number;
    secure?: boolean;
    smtpUser?: string | null;
    smtpPass?: string | null;
    fromEmail?: string | null;
    recipients?: string[];
    subjectTemplate?: string;
    bodyTemplate?: string;
}

export async function sendIncidentEmail(
    projectName: string,
    emailConfig: EmailConfig,
    variables: Record<string, unknown>
): Promise<void> {
    if (!emailConfig.enabled) {
        return;
    }

    if (!emailConfig.smtpHost || !emailConfig.smtpUser || !emailConfig.smtpPass || !emailConfig.fromEmail) {
        throw new Error("Email configuration is incomplete");
    }

    const transporter = nodemailer.createTransport({
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort ?? 587,
        secure: emailConfig.secure ?? false,
        auth: {
            user: emailConfig.smtpUser,
            pass: emailConfig.smtpPass
        }
    });

    const subject = renderTemplate(emailConfig.subjectTemplate ?? "[{{project}}] Incident", {
        project: projectName,
        ...variables
    });
    const text = renderTemplate(emailConfig.bodyTemplate ?? "{{message}}", {
        project: projectName,
        ...variables
    });

    await transporter.sendMail({
        from: emailConfig.fromEmail,
        to: emailConfig.recipients ?? [],
        subject,
        text
    });
}
