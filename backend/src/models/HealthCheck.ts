import mongoose, { Document, Schema, Types } from 'mongoose';

export type HealthCheckStatus = 'healthy' | 'unhealthy' | 'pending';

export interface IHealthCheck extends Document {
    projectId: Types.ObjectId;
    name: string;
    url: string;
    interval: string; // cron expression or predefined (1min, 5min, etc.)
    timeout: number; // milliseconds
    enabled: boolean;
    lastCheck?: Date;
    status: HealthCheckStatus;
    lastError?: string;
    consecutiveFailures: number;
    lastNotificationSent?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const healthCheckSchema = new Schema<IHealthCheck>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        url: {
            type: String,
            required: true,
        },
        interval: {
            type: String,
            required: true,
            default: '5min',
        },
        timeout: {
            type: Number,
            required: true,
            default: 10000, // 10 seconds
        },
        enabled: {
            type: Boolean,
            default: true,
        },
        lastCheck: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['healthy', 'unhealthy', 'pending'],
            default: 'pending',
        },
        lastError: {
            type: String,
        },
        consecutiveFailures: {
            type: Number,
            default: 0,
        },
        lastNotificationSent: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

healthCheckSchema.index({ enabled: 1, status: 1 });

export const HealthCheck = mongoose.model<IHealthCheck>('HealthCheck', healthCheckSchema);
