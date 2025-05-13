import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

import authRoutes from './routes/auth';
import { connectDB } from './config/database';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Default Route
app.get('/', (_req, res) => {
  res.send('API is running...');
});

// Start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
});
