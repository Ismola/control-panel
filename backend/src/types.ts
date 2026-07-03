export type IncidentSeverity = "critical" | "high" | "medium" | "low";

export interface IncomingIncident {
    projectSlug: string;
    serviceName: string;
    severity: IncidentSeverity;
    message: string;
    details?: Record<string, unknown>;
    dedupeKey?: string;
    ingestToken?: string;
}
