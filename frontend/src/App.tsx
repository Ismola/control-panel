import { useEffect, useState } from "react";
import { fetchProjects } from "./api";
import type { Project } from "./types";

function App() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void (async () => {
            try {
                const data = await fetchProjects();
                setProjects(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";
                setError(message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <main className="layout">
            <header>
                <h1>Service Control Panel</h1>
                <p>Administra proyectos, healthchecks, alertas y acciones de Portainer.</p>
            </header>

            <section className="card">
                <h2>Projects</h2>
                {loading ? <p>Loading...</p> : null}
                {error ? <p className="error">{error}</p> : null}
                {!loading && !error ? (
                    <ul>
                        {projects.map((project) => (
                            <li key={project._id}>
                                <strong>{project.name}</strong> ({project.slug}) - {project.active ? "active" : "inactive"}
                            </li>
                        ))}
                    </ul>
                ) : null}
            </section>
        </main>
    );
}

export default App;
