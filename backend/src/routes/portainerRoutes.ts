import { Router } from "express";
import { Project } from "../models/Project.js";
import { getStackDetails, restartStack, stopStack } from "../services/portainerService.js";

export const portainerRoutes = Router();

portainerRoutes.get("/:projectId/stacks/stats", async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const data = await getStackDetails(project.portainerConfig ?? {});
        res.json(data);
    } catch (error) {
        next(error);
    }
});

portainerRoutes.post("/:projectId/stacks/restart", async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        await restartStack(project.portainerConfig ?? {});
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

portainerRoutes.post("/:projectId/stacks/stop", async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        await stopStack(project.portainerConfig ?? {});
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});
