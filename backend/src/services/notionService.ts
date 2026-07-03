import { Client } from "@notionhq/client";

interface NotionConfig {
    enabled?: boolean;
    token?: string | null;
    databaseId?: string | null;
    propertyMapping?: Record<string, string>;
}

export async function createNotionTask(
    notionConfig: NotionConfig,
    payload: Record<string, unknown>
): Promise<string | null> {
    if (!notionConfig.enabled) {
        return null;
    }
    if (!notionConfig.token || !notionConfig.databaseId) {
        throw new Error("Notion configuration is incomplete");
    }

    const notion = new Client({ auth: notionConfig.token });
    const mapping = notionConfig.propertyMapping ?? {};

    const titleKey = mapping.title ?? "Name";
    const severityKey = mapping.severity ?? "Severity";
    const serviceKey = mapping.service ?? "Service";

    const response = await notion.pages.create({
        parent: { database_id: notionConfig.databaseId },
        properties: {
            [titleKey]: {
                title: [{ text: { content: String(payload.message ?? "Incident") } }]
            },
            [severityKey]: {
                rich_text: [{ text: { content: String(payload.severity ?? "unknown") } }]
            },
            [serviceKey]: {
                rich_text: [{ text: { content: String(payload.serviceName ?? "unknown") } }]
            }
        }
    });

    return response.id;
}
