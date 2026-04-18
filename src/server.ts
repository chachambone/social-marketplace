import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

import itemsRouter from './routes/items.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import { setupWebSocketServer } from './webserver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
// IMPORTANT: Bind to 0.0.0.0 to accept connections from outside (Render requirement)
const HOST = '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views/pages'));

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Social Marketplace - Collectible Trading Post',
    description: 'Buy, sell, and negotiate prices on collectible items'
  });
});

// API routes
app.use('/api/items', itemsRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Create HTTP server and attach WebSocket
const server = createServer(app);
setupWebSocketServer(server);

// Bind to 0.0.0.0 to ensure Render can detect the port
//@ts-ignore
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time chat`);
});