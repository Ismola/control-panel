import mongoose from 'mongoose';
import { config } from './index.js';

export async function connectDatabase(): Promise<void> {
    try {
        await mongoose.connect(config.mongodbUri);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB error:', error);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});
