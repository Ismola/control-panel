import axios, { AxiosInstance } from 'axios';
import { IPortainerConfig } from '../models/Project.js';

interface PortainerStack {
    Id: number;
    Name: string;
    Type: number;
    Status: number;
    ResourceControl?: {
        Id: number;
    };
}

interface PortainerStackStats {
    containers: number;
    runningContainers: number;
    stoppedContainers: number;
}

export class PortainerService {
    private static clients = new Map<string, { client: AxiosInstance; timestamp: number }>();
    private static readonly CACHE_TTL = 30000; // 30 seconds

    private static createClient(apiUrl: string, apiToken: string): AxiosInstance {
        const cacheKey = `${apiUrl}:${apiToken}`;
        const cached = this.clients.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.client;
        }

        const client = axios.create({
            baseURL: apiUrl,
            headers: {
                'X-API-Key': apiToken,
            },
            timeout: 10000,
        });

        this.clients.set(cacheKey, { client, timestamp: Date.now() });
        return client;
    }

    static async getStacks(config: IPortainerConfig): Promise<PortainerStack[]> {
        if (!config.enabled || !config.apiUrl || !config.apiToken) {
            throw new Error('Portainer is not properly configured');
        }

        try {
            const client = this.createClient(config.apiUrl, config.apiToken);
            const response = await client.get<PortainerStack[]>('/api/stacks');
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Failed to get Portainer stacks:', errorMessage);
            throw new Error(`Failed to get Portainer stacks: ${errorMessage}`);
        }
    }

    static async getStack(config: IPortainerConfig, stackId: string): Promise<PortainerStack> {
        if (!config.enabled || !config.apiUrl || !config.apiToken) {
            throw new Error('Portainer is not properly configured');
        }

        try {
            const client = this.createClient(config.apiUrl, config.apiToken);
            const response = await client.get<PortainerStack>(`/api/stacks/${stackId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Failed to get Portainer stack:', errorMessage);
            throw new Error(`Failed to get Portainer stack: ${errorMessage}`);
        }
    }

    static async getStackStats(
        config: IPortainerConfig,
        stackId: string
    ): Promise<PortainerStackStats> {
        // In a real implementation, this would query container stats
        // For now, we'll return a simplified version
        const stack = await this.getStack(config, stackId);

        return {
            containers: 0,
            runningContainers: stack.Status === 1 ? 0 : 0,
            stoppedContainers: 0,
        };
    }

    static async startStack(config: IPortainerConfig, stackId: string): Promise<void> {
        if (!config.enabled || !config.apiUrl || !config.apiToken) {
            throw new Error('Portainer is not properly configured');
        }

        try {
            const client = this.createClient(config.apiUrl, config.apiToken);
            await client.post(`/api/stacks/${stackId}/start`);
            console.log(`✅ Started Portainer stack: ${stackId}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Failed to start Portainer stack:', errorMessage);
            throw new Error(`Failed to start Portainer stack: ${errorMessage}`);
        }
    }

    static async stopStack(config: IPortainerConfig, stackId: string): Promise<void> {
        if (!config.enabled || !config.apiUrl || !config.apiToken) {
            throw new Error('Portainer is not properly configured');
        }

        try {
            const client = this.createClient(config.apiUrl, config.apiToken);
            await client.post(`/api/stacks/${stackId}/stop`);
            console.log(`✅ Stopped Portainer stack: ${stackId}`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Failed to stop Portainer stack:', errorMessage);
            throw new Error(`Failed to stop Portainer stack: ${errorMessage}`);
        }
    }

    static async restartStack(config: IPortainerConfig, stackId: string): Promise<void> {
        await this.stopStack(config, stackId);
        // Wait a bit before starting
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await this.startStack(config, stackId);
    }

    static async testConnection(apiUrl: string, apiToken: string): Promise<boolean> {
        try {
            const client = this.createClient(apiUrl, apiToken);
            await client.get('/api/status');
            return true;
        } catch (error) {
            console.error('Portainer connection test failed:', error);
            return false;
        }
    }
}
