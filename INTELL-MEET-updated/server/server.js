import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { initializeSocket } from './services/socketService.js';
import transcribeRoutes from './routes/transcribeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';
dotenv.config();

connectDB();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transcribe', transcribeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/', apiLimiter);

initializeSocket(io);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'IntellMeet Backend' });
});

const PORT = process.env.PORT || 5000;
// Global error handler
app.use((err, req, res, next) => {
  console.error('🔴 ERROR:', err.stack);
  res.status(500).json({ message: err.message });
});
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
