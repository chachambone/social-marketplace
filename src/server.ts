import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import FileStore from 'session-file-store';

import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

import itemsRouter from './routes/items.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import { setupWebSocketServer } from './webserver.js';
import { getCurrentUser } from './utils/auth.js';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// Initialize file session store
const FileStoreSession = FileStore(session);

// Session Configuration with file storage
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: new FileStoreSession({
    path: path.join(__dirname, '../sessions'),
    ttl: 7 * 24 * 60 * 60, // 7 days
    reapInterval: 60 * 60, // Check for expired sessions every hour
    retries: 3,
    logFn: function() {} // Disable logging
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Extend Express Request type to include session
interface CustomRequest extends Request {
  session: session.Session & Partial<session.SessionData>;
}

// Middleware to make user available in all templates
app.use(async (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    try {
      const user = await getCurrentUser(req.session.userId);
      res.locals.user = user;
      res.locals.currentPath = req.path;
    } catch (error) {
      console.error('Error fetching user:', error);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
    res.locals.currentPath = req.path;
  }
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Create sessions directory if it doesn't exist
import fs from 'fs';
const sessionsDir = path.join(__dirname, '../sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../src/assets')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, '../src/views/pages'),
  path.join(__dirname, '../src/views/components')
]);

// Auth check middleware
const redirectIfAuthenticated = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
};

const requireAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

// Routes
app.get('/', async (req: CustomRequest, res: Response) => {
  // If user is logged in, redirect to dashboard
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  
  try {
    // Use absolute URL for internal API calls
    const apiUrl = process.env.API_URL || `http://localhost:${PORT}`;
    const response = await fetch(`${apiUrl}/api/items`);
    const data = await response.json();
    const listings = data.items || data || [];
    
    res.render('index', {
      title: 'BidNest - Social Marketplace for Collectibles',
      description: 'Buy, sell, and negotiate prices on collectible items',
      listings: listings,
      listingsCount: listings.length
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.render('index', {
      title: 'BidNest - Social Marketplace for Collectibles',
      description: 'Buy, sell, and negotiate prices on collectible items',
      listings: [],
      listingsCount: 0
    });
  }
});

app.get('/dashboard', requireAuth, (req: CustomRequest, res: Response) => {
  res.render('dashboard', {
    title: 'Dashboard - BidNest',
    user: res.locals.user
  });
});

app.get('/login', redirectIfAuthenticated, (req: CustomRequest, res: Response) => {
  const redirectUrl = req.query.redirect || '/dashboard';
  
  res.render('login', {
    title: 'Login - BidNest',
    description: 'Login to your BidNest account',
    redirectUrl: redirectUrl,
    showSocialLogin: true,
    socialProviders: ['google', 'github'],
    enableDemoLogin: process.env.NODE_ENV === 'development',
    demoCredentials: {
      email: 'demo@bidnest.com',
      password: 'demo123'
    }
  });
});

app.get('/register', redirectIfAuthenticated, (req: CustomRequest, res: Response) => {
  res.render('register', {
    title: 'Register - BidNest',
    description: 'Create a new BidNest account'
  });
});

app.get('/logout', (req: CustomRequest, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// API routes
app.use('/api/items', itemsRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    storage: 'JSON files',
    sessions: 'File-based'
  });
});

// Debug route to check session (remove in production)
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/session', (req: CustomRequest, res: Response) => {
    res.json({
      sessionId: req.session.id,
      userId: req.session.userId,
      sessionData: req.session
    });
  });
}

// Error handling
app.use(errorHandler);

// Create HTTP server and attach WebSocket
const server = createServer(app);
setupWebSocketServer(server);

// Bind to 0.0.0.0 to ensure Render can detect the port
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time chat`);
  console.log(`💾 Session storage: ${path.join(__dirname, '../sessions')}`);
});