import { Router } from "express";
import { incidentRoutes } from "./incidentRoutes.js";
import { portainerRoutes } from "./portainerRoutes.js";
import { projectRoutes } from "./projectRoutes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

apiRoutes.use("/projects", projectRoutes);
apiRoutes.use("/incidents", incidentRoutes);
apiRoutes.use("/portainer/projects", portainerRoutes);
