import mongoose, { Schema } from "mongoose";

const healthcheckExecutionSchema = new Schema(
    {
        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        checkName: { type: String, required: true },
        url: { type: String, required: true },
        status: { type: Number, required: true },
        responseTimeMs: { type: Number, required: true },
        ok: { type: Boolean, required: true },
        error: { type: String }
    },
    { timestamps: true }
);

export const HealthcheckExecution = mongoose.model("HealthcheckExecution", healthcheckExecutionSchema);
