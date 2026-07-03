import schedule from 'node-schedule';
import { HealthCheck } from '../models/HealthCheck.js';
import { HealthCheckExecutor } from '../services/health-check-executor.service.js';

export class HealthCheckScheduler {
    private static jobs = new Map<string, schedule.Job>();

    static async start(): Promise<void> {
        console.log('🕐 Starting health check scheduler...');

        // Load all enabled health checks
        const healthChecks = await HealthCheck.find({ enabled: true });

        for (const healthCheck of healthChecks) {
            this.scheduleCheck(healthCheck._id.toString(), healthCheck.interval);
        }

        console.log(`✅ Scheduled ${healthChecks.length} health checks`);
    }

    static scheduleCheck(healthCheckId: string, interval: string): void {
        // Cancel existing job if any
        this.cancelCheck(healthCheckId);

        const cronExpression = this.intervalToCron(interval);
        if (!cronExpression) {
            console.error(`Invalid interval for health check ${healthCheckId}: ${interval}`);
            return;
        }

        const job = schedule.scheduleJob(cronExpression, async () => {
            await HealthCheckExecutor.executeCheck(healthCheckId);
        });

        this.jobs.set(healthCheckId, job);
        console.log(`📅 Scheduled health check ${healthCheckId} with interval: ${interval}`);
    }

    static cancelCheck(healthCheckId: string): void {
        const job = this.jobs.get(healthCheckId);
        if (job) {
            job.cancel();
            this.jobs.delete(healthCheckId);
            console.log(`❌ Cancelled health check ${healthCheckId}`);
        }
    }

    static rescheduleCheck(healthCheckId: string, interval: string): void {
        this.scheduleCheck(healthCheckId, interval);
    }

    private static intervalToCron(interval: string): string | null {
        const intervalMap: Record<string, string> = {
            '1min': '*/1 * * * *',
            '5min': '*/5 * * * *',
            '15min': '*/15 * * * *',
            '30min': '*/30 * * * *',
            '1h': '0 * * * *',
            '6h': '0 */6 * * *',
            '12h': '0 */12 * * *',
            '24h': '0 0 * * *',
        };

        // Check if it's a predefined interval
        if (intervalMap[interval]) {
            return intervalMap[interval];
        }

        // Check if it's a custom cron expression (basic validation)
        if (this.isValidCron(interval)) {
            return interval;
        }

        return null;
    }

    private static isValidCron(expression: string): boolean {
        // Basic cron validation: should have 5 or 6 parts
        const parts = expression.trim().split(/\s+/);
        return parts.length === 5 || parts.length === 6;
    }

    static async stop(): Promise<void> {
        console.log('🛑 Stopping health check scheduler...');
        for (const [id, job] of this.jobs) {
            job.cancel();
            console.log(`❌ Cancelled health check ${id}`);
        }
        this.jobs.clear();
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    await HealthCheckScheduler.stop();
});

process.on('SIGINT', async () => {
    await HealthCheckScheduler.stop();
});
