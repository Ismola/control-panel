import mongoose, { Schema } from "mongoose";

const healthcheckSchema = new Schema(
    {
        name: { type: String, required: true },
        url: { type: String, required: true },
        method: { type: String, default: "GET" },
        intervalSeconds: { type: Number, default: 60 },
        timeoutMs: { type: Number, default: 3000 },
        expectedStatus: { type: Number, default: 200 },
        retries: { type: Number, default: 1 },
        enabled: { type: Boolean, default: true }
    },
    { _id: true }
);

const projectSchema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        active: { type: Boolean, default: true },
        ingestToken: { type: String },
        emailConfig: {
            enabled: { type: Boolean, default: false },
            smtpHost: { type: String },
            smtpPort: { type: Number, default: 587 },
            secure: { type: Boolean, default: false },
            smtpUser: { type: String },
            smtpPass: { type: String },
            fromEmail: { type: String },
            recipients: [{ type: String }],
            subjectTemplate: { type: String, default: "[{{project}}] Incidente {{severity}}" },
            bodyTemplate: {
                type: String,
                default: "Servicio: {{serviceName}}\nMensaje: {{message}}\nSeveridad: {{severity}}"
            }
        },
        notionConfig: {
            enabled: { type: Boolean, default: false },
            token: { type: String },
            databaseId: { type: String },
            propertyMapping: { type: Schema.Types.Mixed, default: {} }
        },
        portainerConfig: {
            enabled: { type: Boolean, default: false },
            baseUrl: { type: String },
            endpointId: { type: Number },
            stackId: { type: Number },
            token: { type: String }
        },
        healthchecks: [healthcheckSchema]
    },
    { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
