import bcrypt from 'bcrypt';
import { User, IUser } from '../models/User.js';

const SALT_ROUNDS = 10;

export class AuthService {
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    static async createUser(email: string, password: string): Promise<IUser> {
        const passwordHash = await this.hashPassword(password);
        const user = new User({ email, passwordHash });
        return user.save();
    }

    static async findUserByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email });
    }

    static async validateUser(email: string, password: string): Promise<IUser | null> {
        const user = await this.findUserByEmail(email);
        if (!user) {
            return null;
        }

        const isValid = await this.comparePassword(password, user.passwordHash);
        return isValid ? user : null;
    }

    static async initializeAdminUser(email: string, password: string): Promise<void> {
        const existingUser = await this.findUserByEmail(email);
        if (existingUser) {
            console.log('ℹ️  Admin user already exists');
            return;
        }

        await this.createUser(email, password);
        console.log(`✅ Created initial admin user: ${email}`);
    }
}
