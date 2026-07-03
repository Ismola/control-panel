import { Router } from "express";
import { z } from "zod";
import { createIncident } from "../services/incidentService.js";

const incidentSchema = z.object({
    projectSlug: z.string().min(1),
    serviceName: z.string().min(1),
    severity: z.enum(["critical", "high", "medium", "low"]),
    message: z.string().min(1),
    details: z.record(z.string(), z.unknown()).optional(),
    dedupeKey: z.string().optional()
});

export const incidentRoutes = Router();

incidentRoutes.post("/", async (req, res, next) => {
    try {
        const payload = incidentSchema.parse(req.body);
        const ingestToken = req.header("x-project-token") ?? undefined;
        const incident = await createIncident({ ...payload, ingestToken });
        res.status(201).json(incident);
    } catch (error) {
        next(error);
    }
});
