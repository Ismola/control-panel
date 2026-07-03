import mongoose, { Schema } from "mongoose";

const incidentSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        sourceService: { type: String, required: true },
        severity: { type: String, required: true, enum: ["critical", "high", "medium", "low"] },
        message: { type: String, required: true },
        details: { type: Schema.Types.Mixed },
        dedupeKey: { type: String },
        status: { type: String, default: "open" },
        notifiedAt: { type: Date },
        notionTaskId: { type: String }
    },
    { timestamps: true }
);

export const Incident = mongoose.model("Incident", incidentSchema);
