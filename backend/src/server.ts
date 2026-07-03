import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { connectMongo } from "./lib/mongo.js";
import { startHealthcheckScheduler } from "./services/healthcheckService.js";

async function bootstrap(): Promise<void> {
    await connectMongo(env.MONGODB_URI);

    const app = createApp();
    app.listen(env.PORT, () => {
        logger.info(`Backend listening on port ${env.PORT}`);
    });

    startHealthcheckScheduler();
}

bootstrap().catch((error) => {
    logger.error("Unable to bootstrap backend", error);
    process.exit(1);
});
