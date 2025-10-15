// server.js
import 'dotenv/config';
import express, { json, urlencoded } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

import connectDB from './src/config/db.js';
import postRoutes from './src/routes/postRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import redisClient from './src/utils/redisClient.js';
import initSockets from './src/sockets/index.js';


// ----------------------------
// 🚀 App Initialization
// ----------------------------
const app = express();
const server = createServer(app);

// ----------------------------
// 🌐 Middleware
// ----------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));

// ----------------------------
// 🗄️ Database Connection
// ----------------------------
connectDB()
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

// ----------------------------
// 🔌 Socket.IO Initialization
// ----------------------------
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  maxHttpBufferSize: 1e7, // ~10MB (for media events)
});

// ----------------------------
// 🔁 Redis Adapter for Socket.IO
// ----------------------------
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = Number(process.env.REDIS_PORT || 6379);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

const pubClient = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
});

const subClient = pubClient.duplicate();

pubClient.on('connect', () => console.log('✅ Redis Publisher connected'));
subClient.on('connect', () => console.log('✅ Redis Subscriber connected'));

pubClient.on('error', (err) => console.error('❌ Redis Publisher error:', err));
subClient.on('error', (err) => console.error('❌ Redis Subscriber error:', err));

// Attach Redis adapter to IO (supports horizontal scaling)
io.adapter(createAdapter(pubClient, subClient));

// ----------------------------
// 🧠 Make io available in routes/controllers
// ----------------------------
app.set('io', io);

// ----------------------------
// 🧩 Initialize Socket Handlers
// ----------------------------
initSockets(io);

// ----------------------------
// 📦 API Routes
// ----------------------------
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', redis: redisClient.status, time: new Date() });
});

// ----------------------------
// 🚀 Server Start
// ----------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌍 Server listening on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
