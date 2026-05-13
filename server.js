import express from 'express';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';


dotenv.config();

import authRoutes from './src/server/routes/auth.js';
import blogRoutes from './src/server/routes/blog.js';
import interactionRoutes from './src/server/routes/interaction.js';
import adminRoutes from './src/server/routes/admin.js';
import { seedData } from './src/server/seed.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // DB Connection
  const dbUrl = process.env.DATABASE_URL;
  let isDbConnected = false;

  if (dbUrl && (dbUrl.startsWith('mongodb://') || dbUrl.startsWith('mongodb+srv://'))) {
  mongoose.connect(dbUrl)
  .then(async () => {

    console.log('MongoDB Connected');

    isDbConnected = true;

    await seedData();

  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });
  } else {
    console.warn('CRITICAL: DATABASE_URL is missing or invalid. Please add your MongoDB Atlas connection string to the Secrets panel.');
    console.log('Example: mongodb+srv://username:password@cluster.mongodb.net/techtalks');
  }

  app.use(cors());
  app.use(express.json());

  // Middleware to check DB connection
  app.use((req, res, next) => {
    if (!isDbConnected && req.path.startsWith('/api/') && req.path !== '/api/health') {
      return res.status(503).json({ 
        error: 'Database not connected', 
        message: 'Please provide a valid DATABASE_URL in the environment variables (Secrets panel).' 
      });
    }
    next();
  });

  // API Routes
  app.get('/api/health', (req, res) => res.json({ status: isDbConnected ? 'connected' : 'disconnected' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/blogs', blogRoutes);
  app.use('/api/interactions', interactionRoutes);
  app.use('/api/admin', adminRoutes);

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
