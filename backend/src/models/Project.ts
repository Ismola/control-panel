import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailConfig {
    smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string;
            pass: string;
        };
    };
    from: string;
    developers: string[];
}

export interface INotionConfig {
    enabled: boolean;
    integrationToken?: string;
    databaseId?: string;
    propertyMappings?: {
        title?: string;
        description?: string;
        priority?: string;
        status?: string;
        [key: string]: string | undefined;
    };
}

export interface IPortainerConfig {
    enabled: boolean;
    apiUrl?: string;
    apiToken?: string;
    stackId?: string;
}

export interface IProject extends Document {
    name: string;
    description: string;
    apiKey: string;
    emailConfig?: IEmailConfig;
    notionConfig?: INotionConfig;
    portainerConfig?: IPortainerConfig;
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        apiKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        emailConfig: {
            smtp: {
                host: String,
                port: Number,
                secure: Boolean,
                auth: {
                    user: String,
                    pass: String,
                },
            },
            from: String,
            developers: [String],
        },
        notionConfig: {
            enabled: {
                type: Boolean,
                default: false,
            },
            integrationToken: String,
            databaseId: String,
            propertyMappings: Schema.Types.Mixed,
        },
        portainerConfig: {
            enabled: {
                type: Boolean,
                default: false,
            },
            apiUrl: String,
            apiToken: String,
            stackId: String,
        },
    },
    {
        timestamps: true,
    }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
