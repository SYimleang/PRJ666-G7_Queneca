import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = (process.env.JWT_SECRET);

// Check if JWT_SECRET is defined
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment variables');
}

// hashPassword hashes a password using bcrypt
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

// validatePassword compares a plain password with a hashed password
export async function validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

// generateToken creates a JWT token for a user
export function generateToken(payload: object, expiresIn: SignOptions['expiresIn'] = '1d'): string {
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
}

// verifyToken verifies a JWT token and returns the decoded user information
export function verifyToken(token: string): { id: string; email: string } | null {
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    } catch (err) {
        console.error("Token verification failed:", err);
        return null;
    }
}