export interface Config {
    env: string;
    port: number;
    host: string;
    mongodbUri: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    admin: {
        email: string;
        password: string;
    };
    cors: {
        origin: string[];
    };
    logLevel: string;
}

export const config: Config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '8080', 10),
    host: process.env.HOST || '0.0.0.0',
    mongodbUri: process.env.MONGODB_URI || 'mongodb://mongo:27017/control-panel',
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    admin: {
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
    },
    cors: {
        origin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
            .split(',')
            .map((o) => o.trim()),
    },
    logLevel: process.env.LOG_LEVEL || 'info',
};
