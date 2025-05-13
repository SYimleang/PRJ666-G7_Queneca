import { hashPassword, validatePassword, generateToken, verifyToken } from '../../src/lib/auth';

describe("Auth Module", () => {
    it('hashes and verifies a password correctly', async () => {
        const password = "password123";
        const hashedPassword = await hashPassword(password);
        const isValid = await validatePassword(password, hashedPassword);
        expect(isValid).toBe(true);
    });

    it('throws if wrong password provided', async () => {
        const hash = await hashPassword("correctPassword");
        const isValid = await validatePassword("wrongPassword", hash);
        expect(isValid).toBe(false);
    });

    it('generates and verifies a token correctly', () => {
        const payload = { email: 'test@email.com' };
        const token = generateToken(payload);
        const decoded = verifyToken(token);
        expect(decoded?.email).toBe('test@email.com');
    });

    it('returns null for invalid JWT', () => {
        const invalidToken = "fake.invalid.token";
        const decoded = verifyToken(invalidToken);
        expect(decoded).toBeNull();
    });

});