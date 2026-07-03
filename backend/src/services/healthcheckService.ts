import axios from "axios";
import { HealthcheckExecution } from "../models/HealthcheckExecution.js";
import { Project } from "../models/Project.js";
import { logger } from "../lib/logger.js";
import { createHealthcheckIncident } from "./incidentService.js";

const lastRun = new Map<string, number>();

async function runChecks(): Promise<void> {
    const projects = await Project.find({ active: true, "healthchecks.enabled": true });

    for (const project of projects) {
        for (const check of project.healthchecks ?? []) {
            if (!check.enabled) {
                continue;
            }

            const checkId = `${project.slug}:${check._id}`;
            const now = Date.now();
            const previous = lastRun.get(checkId) ?? 0;
            if (now - previous < (check.intervalSeconds ?? 60) * 1000) {
                continue;
            }

            lastRun.set(checkId, now);

            try {
                const started = Date.now();
                const response = await axios.request({
                    method: check.method ?? "GET",
                    url: check.url,
                    timeout: check.timeoutMs ?? 3000,
                    validateStatus: () => true
                });

                const expectedStatus = check.expectedStatus ?? 200;
                const ok = response.status === expectedStatus;

                await HealthcheckExecution.create({
                    projectId: project._id,
                    checkName: check.name,
                    url: check.url,
                    status: response.status,
                    responseTimeMs: Date.now() - started,
                    ok
                });

                if (!ok) {
                    await createHealthcheckIncident(
                        project.slug,
                        check.name,
                        `Healthcheck ${check.name} failed with status ${response.status}`
                    );
                }
            } catch (error) {
                logger.error("Healthcheck request failed", { project: project.slug, check: check.name, error });
                await HealthcheckExecution.create({
                    projectId: project._id,
                    checkName: check.name,
                    url: check.url,
                    status: 0,
                    responseTimeMs: 0,
                    ok: false,
                    error: error instanceof Error ? error.message : "Unknown error"
                });
                await createHealthcheckIncident(project.slug, check.name, `Healthcheck ${check.name} request failed`);
            }
        }
    }
}

export function startHealthcheckScheduler(): void {
    setInterval(() => {
        void runChecks();
    }, 15000);
}
