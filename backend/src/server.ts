import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import documentRoutes from './routes/documents';
import userRoutes from './routes/users';
import config from './config';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests', errorCode: 'RATE_LIMIT_EXCEEDED' },
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
