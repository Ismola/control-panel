import axios from "axios";

interface PortainerConfig {
    enabled?: boolean;
    baseUrl?: string | null;
    endpointId?: number | null;
    stackId?: number | null;
    token?: string | null;
}

function getClient(config: PortainerConfig) {
    if (!config.enabled || !config.baseUrl || !config.token || !config.endpointId || !config.stackId) {
        throw new Error("Portainer configuration is incomplete");
    }

    return axios.create({
        baseURL: config.baseUrl,
        headers: {
            Authorization: `Bearer ${config.token}`
        },
        timeout: 10000
    });
}

export async function getStackDetails(config: PortainerConfig) {
    const client = getClient(config);
    const response = await client.get(`/api/stacks/${config.stackId}?endpointId=${config.endpointId}`);
    return response.data;
}

export async function stopStack(config: PortainerConfig) {
    const client = getClient(config);
    await client.post(`/api/stacks/${config.stackId}/stop?endpointId=${config.endpointId}`);
}

export async function restartStack(config: PortainerConfig) {
    const client = getClient(config);
    await client.post(`/api/stacks/${config.stackId}/start?endpointId=${config.endpointId}`);
}
