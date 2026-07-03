const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
export async function fetchProjects() {
    const response = await fetch(`${API_BASE_URL}/api/v1/projects`);
    if (!response.ok) {
        throw new Error("Unable to load projects");
    }
    return response.json();
}
