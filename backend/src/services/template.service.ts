export interface TemplateVariables {
    serviceName: string;
    error: string;
    timestamp: string;
    severity?: string;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
}

export class TemplateService {
    static renderTemplate(template: string, variables: TemplateVariables): string {
        let rendered = template;

        // Replace all {{variableName}} with actual values
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            const replacement = this.formatValue(value);
            rendered = rendered.replace(new RegExp(placeholder, 'g'), replacement);
        }

        return rendered;
    }

    private static formatValue(value: unknown): string {
        if (value === null || value === undefined) {
            return '';
        }

        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }

        return String(value);
    }

    static getDefaultTemplate(): {
        subject: string;
        htmlBody: string;
        textBody: string;
    } {
        return {
            subject: '🚨 Service Failure: {{serviceName}}',
            htmlBody: `
        <h2 style="color: #dc2626;">Service Failure Notification</h2>
        <p><strong>Service:</strong> {{serviceName}}</p>
        <p><strong>Error:</strong> {{error}}</p>
        <p><strong>Timestamp:</strong> {{timestamp}}</p>
        <p><strong>Severity:</strong> {{severity}}</p>
        {{#metadata}}
        <h3>Additional Information:</h3>
        <pre style="background-color: #f3f4f6; padding: 10px; border-radius: 5px;">{{metadata}}</pre>
        {{/metadata}}
        <hr style="margin-top: 20px;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated notification from Control Panel.
        </p>
      `,
            textBody: `
🚨 SERVICE FAILURE NOTIFICATION

Service: {{serviceName}}
Error: {{error}}
Timestamp: {{timestamp}}
Severity: {{severity}}

{{#metadata}}
Additional Information:
{{metadata}}
{{/metadata}}

---
This is an automated notification from Control Panel.
      `.trim(),
        };
    }

    static validateTemplate(template: string): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        // Check for unclosed braces
        const openBraces = (template.match(/{{/g) || []).length;
        const closeBraces = (template.match(/}}/g) || []).length;

        if (openBraces !== closeBraces) {
            errors.push('Unclosed template variables detected');
        }

        // Check for empty variables
        const emptyVars = template.match(/{{s*}}/g);
        if (emptyVars) {
            errors.push('Empty template variables found');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    static extractVariables(template: string): string[] {
        const matches = template.match(/{{([^}]+)}}/g) || [];
        return matches.map((match) => match.replace(/{{|}}/g, '').trim());
    }
}
