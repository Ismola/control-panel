import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType = 'email' | 'notion';
export type NotificationStatus = 'success' | 'failed';

export interface INotificationLog extends Document {
    projectId: Types.ObjectId;
    type: NotificationType;
    status: NotificationStatus;
    message?: string;
    error?: string;
    metadata?: Record<string, unknown>;
    timestamp: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
    {
        projectId: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['email', 'notion'],
            required: true,
        },
        status: {
            type: String,
            enum: ['success', 'failed'],
            required: true,
        },
        message: {
            type: String,
        },
        error: {
            type: String,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: false,
    }
);

// Index for querying logs by project and time range
notificationLogSchema.index({ projectId: 1, timestamp: -1 });
notificationLogSchema.index({ status: 1, timestamp: -1 });

// TTL index to auto-delete logs older than 30 days
notificationLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const NotificationLog = mongoose.model<INotificationLog>('NotificationLog', notificationLogSchema);
