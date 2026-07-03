import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { apiRoutes } from "./routes/index.js";

export function createApp() {
    const app = express();

    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: "1mb" }));
    app.use(morgan("combined"));

    app.use("/api/v1", apiRoutes);

    app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        const message = error instanceof Error ? error.message : "Unexpected error";
        res.status(400).json({ message });
    });

    return app;
}
