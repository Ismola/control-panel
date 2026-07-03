import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { fetchProjects } from "./api";
function App() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        void (async () => {
            try {
                const data = await fetchProjects();
                setProjects(data);
            }
            catch (err) {
                const message = err instanceof Error ? err.message : "Unknown error";
                setError(message);
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    return (_jsxs("main", { className: "layout", children: [_jsxs("header", { children: [_jsx("h1", { children: "Service Control Panel" }), _jsx("p", { children: "Administra proyectos, healthchecks, alertas y acciones de Portainer." })] }), _jsxs("section", { className: "card", children: [_jsx("h2", { children: "Projects" }), loading ? _jsx("p", { children: "Loading..." }) : null, error ? _jsx("p", { className: "error", children: error }) : null, !loading && !error ? (_jsx("ul", { children: projects.map((project) => (_jsxs("li", { children: [_jsx("strong", { children: project.name }), " (", project.slug, ") - ", project.active ? "active" : "inactive"] }, project._id))) })) : null] })] }));
}
export default App;
