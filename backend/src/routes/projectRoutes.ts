import { Router } from "express";
import { HealthcheckExecution } from "../models/HealthcheckExecution.js";
import { Project } from "../models/Project.js";
import { sendIncidentEmail } from "../services/emailService.js";
import { createNotionTask } from "../services/notionService.js";

export const projectRoutes = Router();

projectRoutes.get("/", async (_req, res, next) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        next(error);
    }
});

projectRoutes.post("/", async (req, res, next) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
});

projectRoutes.patch("/:id", async (req, res, next) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        res.json(project);
    } catch (error) {
        next(error);
    }
});

projectRoutes.get("/:id/healthchecks/history", async (req, res, next) => {
    try {
        const history = await HealthcheckExecution.find({ projectId: req.params.id }).sort({ createdAt: -1 }).limit(100);
        res.json(history);
    } catch (error) {
        next(error);
    }
});

projectRoutes.post("/:id/test-email", async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }

        await sendIncidentEmail(project.name, project.emailConfig ?? {}, {
            project: project.name,
            serviceName: "manual-test",
            severity: "low",
            message: "Email test from control panel"
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

projectRoutes.post("/:id/test-notion", async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }

        const taskId = await createNotionTask(project.notionConfig ?? {}, {
            serviceName: "manual-test",
            severity: "low",
            message: `Notion test from ${project.name}`
        });
        res.status(201).json({ taskId });
    } catch (error) {
        next(error);
    }
});
