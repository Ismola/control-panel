import { Incident } from "../models/Incident.js";
import { Project } from "../models/Project.js";
import type { IncomingIncident } from "../types.js";
import { sendIncidentEmail } from "./emailService.js";
import { createNotionTask } from "./notionService.js";

export async function createIncident(input: IncomingIncident) {
    const project = await Project.findOne({ slug: input.projectSlug, active: true });
    if (!project) {
        throw new Error("Project not found");
    }
    if (project.ingestToken && project.ingestToken !== input.ingestToken) {
        throw new Error("Invalid project token");
    }

    const incident = await Incident.create({
        projectId: project._id,
        sourceService: input.serviceName,
        severity: input.severity,
        message: input.message,
        details: input.details,
        dedupeKey: input.dedupeKey
    });

    const templateData = {
        project: project.name,
        serviceName: input.serviceName,
        severity: input.severity,
        message: input.message,
        incidentId: incident._id.toString()
    };

    await sendIncidentEmail(project.name, project.emailConfig ?? {}, templateData);
    const notionTaskId = await createNotionTask(project.notionConfig ?? {}, templateData);

    incident.notionTaskId = notionTaskId ?? undefined;
    incident.notifiedAt = new Date();
    await incident.save();

    return incident;
}

export async function createHealthcheckIncident(projectSlug: string, checkName: string, message: string) {
    return createIncident({
        projectSlug,
        serviceName: `healthcheck:${checkName}`,
        severity: "high",
        message,
        dedupeKey: `${projectSlug}-${checkName}`
    });
}
