import axios from 'axios';
import { HealthCheck } from '../models/HealthCheck.js';
import { NotificationService } from './notification.service.js';

export class HealthCheckExecutor {
    private static readonly COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes
    private static readonly FAILURE_THRESHOLD = 2; // consecutive failures before notifying

    static async executeCheck(healthCheckId: string): Promise<void> {
        const healthCheck = await HealthCheck.findById(healthCheckId).populate('projectId');
        if (!healthCheck || !healthCheck.enabled) {
            return;
        }

        try {
            const startTime = Date.now();
            const response = await axios.get(healthCheck.url, {
                timeout: healthCheck.timeout,
                validateStatus: (status) => status >= 200 && status < 300,
            });
            const duration = Date.now() - startTime;

            const wasUnhealthy = healthCheck.status === 'unhealthy';

            // Update health check status
            healthCheck.lastCheck = new Date();
            healthCheck.status = 'healthy';
            healthCheck.consecutiveFailures = 0;
            healthCheck.lastError = undefined;
            await healthCheck.save();

            console.log(`✅ Health check passed: ${healthCheck.name} (${duration}ms, status: ${response.status})`);

            // If recovered from unhealthy, optionally send recovery notification
            if (wasUnhealthy) {
                console.log(`🔄 Service recovered: ${healthCheck.name}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const previousFailures = healthCheck.consecutiveFailures;

            // Update health check status
            healthCheck.lastCheck = new Date();
            healthCheck.status = 'unhealthy';
            healthCheck.consecutiveFailures += 1;
            healthCheck.lastError = errorMessage;
            await healthCheck.save();

            console.error(`❌ Health check failed: ${healthCheck.name} - ${errorMessage}`);

            // Check if we should send notification
            const shouldNotify = this.shouldSendNotification(healthCheck, previousFailures);

            if (shouldNotify) {
                try {
                    // Send notification using projectId as ObjectId
                    await NotificationService.sendFailureNotification(
                        healthCheck.projectId as any,
                        {
                            serviceName: healthCheck.name,
                            error: `Health check failed: ${errorMessage}`,
                            timestamp: new Date().toISOString(),
                            severity: 'critical',
                            metadata: {
                                url: healthCheck.url,
                                consecutiveFailures: healthCheck.consecutiveFailures,
                                lastCheck: healthCheck.lastCheck,
                            },
                        }
                    );

                    healthCheck.lastNotificationSent = new Date();
                    await healthCheck.save();

                    console.log(`📧 Notification sent for failed health check: ${healthCheck.name}`);
                } catch (notificationError) {
                    console.error('Failed to send health check notification:', notificationError);
                }
            }
        }
    }

    private static shouldSendNotification(
        healthCheck: { consecutiveFailures: number; lastNotificationSent?: Date },
        previousFailures: number
    ): boolean {
        // Only notify if we've reached the failure threshold
        if (healthCheck.consecutiveFailures < this.FAILURE_THRESHOLD) {
            return false;
        }

        // Only notify on the first time we reach the threshold
        if (previousFailures >= this.FAILURE_THRESHOLD) {
            return false;
        }

        // Check cooldown period
        if (healthCheck.lastNotificationSent) {
            const timeSinceLastNotification = Date.now() - healthCheck.lastNotificationSent.getTime();
            if (timeSinceLastNotification < this.COOLDOWN_PERIOD) {
                return false;
            }
        }

        return true;
    }
}
