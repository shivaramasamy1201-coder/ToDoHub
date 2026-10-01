import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/assistant', assistantRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('ToDoHub API Service is running. Access /api/health for status.');
});

// Start DB connection attempt
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 ToDoHub Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check endpoint: http://localhost:${PORT}/api/health`);
});
