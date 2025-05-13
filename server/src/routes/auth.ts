import express, { Request, Response } from 'express';
import { hashPassword, validatePassword, generateToken } from '../lib/auth';

const router = express.Router();

// Sample in-memory database (replace with MongoDB logic later)
const users: { email: string; password: string; id: string }[] = [];

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const userExists = users.find((u) => u.email === email);

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const hashedPassword = await hashPassword(password);
  const newUser = { id: Date.now().toString(), email, password: hashedPassword };
  users.push(newUser);

  const token = generateToken({ id: newUser.id, email: newUser.email });

  res.status(201).json({ message: 'User registered', token });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);

  if (!user || !(await validatePassword(password, user.password))) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = generateToken({ id: user.id, email: user.email });

  res.status(200).json({ message: 'Login successful', token });
});

export default router;
