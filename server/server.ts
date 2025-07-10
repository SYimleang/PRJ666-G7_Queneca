import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import restaurantRoutes from "./routes/restaurants";
import menuRoutes from "./routes/menus";
import adminRoutes from "./routes/admin";
import staffRouter from "./routes/staff";
import termsRouter from "./routes/terms";
import faqsRouter from "./routes/faqs";
import { connectDB } from "./config/database";

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff-mgmt", staffRouter);
app.use('/api/terms', termsRouter);
app.use('/api/faqs', faqsRouter);

// Default Route
app.get("/", (_req, res) => {
  res.send("API is running...");
});

// Start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  });
