import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEmailTemplate extends Document {
    projectId: Types.ObjectId;
    name: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const emailTemplateSchema = new Schema<IEmailTemplate>(
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
        subject: {
            type: String,
            required: true,
        },
        htmlBody: {
            type: String,
            required: true,
        },
        textBody: {
            type: String,
            required: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure only one default template per project
emailTemplateSchema.index({ projectId: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

export const EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);
