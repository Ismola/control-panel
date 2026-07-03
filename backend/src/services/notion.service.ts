import { Client } from '@notionhq/client';
import { INotionConfig } from '../models/Project.js';
import { NotificationLog } from '../models/NotificationLog.js';
import { Types } from 'mongoose';

export interface NotionTaskProperties {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    [key: string]: string | undefined;
}

export class NotionService {
    private static createClient(integrationToken: string): Client {
        return new Client({ auth: integrationToken });
    }

    static async createTask(
        projectId: Types.ObjectId,
        config: INotionConfig,
        properties: NotionTaskProperties
    ): Promise<void> {
        if (!config.enabled || !config.integrationToken || !config.databaseId) {
            throw new Error('Notion integration is not properly configured');
        }

        const notion = this.createClient(config.integrationToken);
        const mappings = config.propertyMappings || {};

        try {
            // Build Notion page properties based on mappings
            const notionProperties: Record<string, unknown> = {};

            // Title property (required by Notion)
            const titleProp = mappings.title || 'Name';
            notionProperties[titleProp] = {
                title: [
                    {
                        text: {
                            content: properties.title,
                        },
                    },
                ],
            };

            // Description property (if mapped)
            if (properties.description && mappings.description) {
                notionProperties[mappings.description] = {
                    rich_text: [
                        {
                            text: {
                                content: properties.description,
                            },
                        },
                    ],
                };
            }

            // Priority property (if mapped)
            if (properties.priority && mappings.priority) {
                notionProperties[mappings.priority] = {
                    select: {
                        name: properties.priority,
                    },
                };
            }

            // Status property (if mapped)
            if (properties.status && mappings.status) {
                notionProperties[mappings.status] = {
                    select: {
                        name: properties.status,
                    },
                };
            }

            // Add any additional custom properties
            for (const [key, value] of Object.entries(properties)) {
                if (!['title', 'description', 'priority', 'status'].includes(key)) {
                    const mappedKey = mappings[key];
                    if (mappedKey && value) {
                        notionProperties[mappedKey] = {
                            rich_text: [
                                {
                                    text: {
                                        content: value,
                                    },
                                },
                            ],
                        };
                    }
                }
            }

            const response = await notion.pages.create({
                parent: {
                    database_id: config.databaseId,
                },
                properties: notionProperties as any,
            });

            // Log success
            await NotificationLog.create({
                projectId,
                type: 'notion',
                status: 'success',
                message: 'Notion task created successfully',
                metadata: {
                    pageId: response.id,
                    properties: Object.keys(notionProperties),
                },
            });

            console.log('✅ Notion task created:', response.id);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Notion task creation failed:', errorMessage);

            // Log failure
            await NotificationLog.create({
                projectId,
                type: 'notion',
                status: 'failed',
                error: errorMessage,
                metadata: {
                    databaseId: config.databaseId,
                },
            });

            throw new Error(`Failed to create Notion task: ${errorMessage}`);
        }
    }

    static async testConnection(
        integrationToken: string,
        databaseId: string
    ): Promise<{ success: boolean; error?: string; properties?: string[] }> {
        try {
            const notion = this.createClient(integrationToken);
            const database = await notion.databases.retrieve({
                database_id: databaseId,
            });

            // Extract available property names
            const properties = Object.keys(database.properties);

            return {
                success: true,
                properties,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Notion connection test failed:', errorMessage);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
}
