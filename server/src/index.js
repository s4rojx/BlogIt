import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import userRoutes from './routes/users.js';
import friendRoutes from './routes/friends.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blogit';

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET'
});

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.get('/', (req, res) => {
  res.json({ message: 'BlogIt API is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: 'Server error' });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
