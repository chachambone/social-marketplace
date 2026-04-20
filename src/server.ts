// ============================================
// 1. IMPORTS & DECLARATIONS
// ============================================
import 'express-session';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import FileStore from 'session-file-store';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import fs from 'fs';

// Extend session data interface
declare module 'express-session' {
  interface SessionData {
    userId: string;
    user: {
      id: string;
      email: string;
      username: string;
      userType: string;
    };
  }
}

// Add Express namespace augmentation
declare global {
  namespace Express {
    interface Request {
      session: session.Session & Partial<session.SessionData>;
    }
  }
}

// Custom Request type
interface CustomRequest extends Request {
  session: session.Session & Partial<session.SessionData>;
}

// Import routes and utilities
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import itemsRouter from './routes/items.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import { setupWebSocketServer } from './webserver.js';
import { getCurrentUser } from './utils/auth.js';
import { readItems } from './utils/fileHelpers.js';

// Load environment variables
dotenv.config();

// ============================================
// 2. APP INITIALIZATION
// ============================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';
const FileStoreSession = FileStore(session);

// Create sessions directory
const sessionsDir = path.join(process.cwd(), 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
  console.log(`Created sessions directory: ${sessionsDir}`);
}

// Verify write permissions
try {
  fs.accessSync(sessionsDir, fs.constants.W_OK);
  console.log(`✅ Sessions directory is writable: ${sessionsDir}`);
} catch (err) {
  console.error(`❌ Sessions directory is NOT writable: ${sessionsDir}`, err);
}

// ============================================
// 3. MIDDLEWARE (Order matters!)
// ============================================

// 3.1 CORS (Must be first)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// 3.2 JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3.3 SESSION MIDDLEWARE (Critical - before any session access)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: new FileStoreSession({
    path: sessionsDir,
    ttl: 7 * 24 * 60 * 60,
    reapInterval: 60 * 60,
    retries: 3,
    logFn: function(msg) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SessionStore] ${msg}`);
      }
    }
  }),
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    domain: undefined,
    path: '/'
  },
  name: 'bidhive.sid',
  proxy: true,
  rolling: true
}));

// 3.4 Session debugging middleware (ONLY AFTER session is initialized)
app.use((req: CustomRequest, res: Response, next: NextFunction) => {
  console.log('='.repeat(80));
  console.log(`${req.method} ${req.path}`);
  console.log(`Cookie header: ${req.headers.cookie || 'NO COOKIE SENT'}`);
  console.log(`Session ID: ${req.session?.id || 'NO SESSION'}`);
  console.log(`Session UserId: ${req.session?.userId || 'undefined'}`);
  next();
});

// 3.5 User middleware (populates res.locals.user)
app.use(async (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
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

// 3.6 Request logger
app.use(requestLogger);

// ============================================
// 4. STATIC FILES & VIEW ENGINE
// ============================================
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../src/assets')));

app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, '../src/views/pages'),
  path.join(__dirname, '../src/views/components')
]);

// ============================================
// 5. AUTH MIDDLEWARE
// ============================================
const requireAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.redirect('/login');
  }
  next();
};

const redirectIfAuthenticated = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    return res.redirect('/');
  }
  next();
};

// ============================================
// 6. TEST ROUTES (For debugging)
// ============================================
app.get('/test-set-session', (req: CustomRequest, res: Response) => {
  console.log('🔧 TEST ROUTE HIT');
  
  if (!req.session) {
    return res.status(500).json({ error: 'Session not initialized' });
  }
  
  req.session.userId = 'test-user-123';
  req.session.user = {
    id: 'test-user-123',
    email: 'test@test.com',
    username: 'testuser',
    userType: 'buyer'
  };
  
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ error: 'Failed to save session' });
    }
    
    console.log('Test session set successfully!');
    res.json({ 
      message: 'Session set successfully!',
      sessionId: req.session.id,
      userId: req.session.userId
    });
  });
});

// ============================================
// 7. PAGE ROUTES
// ============================================

// Home page
app.get('/', async (req: CustomRequest, res: Response) => {
  try {
    let items = readItems();
    const listings = items || [];
    
    if (req.session?.userId && res.locals.user) {
      return res.render('index', {
        title: 'BidHive - Social Marketplace for Collectibles',
        description: 'Buy, sell, and negotiate prices on collectible items',
        listings: listings,
        listingsCount: listings.length,
        user: res.locals.user,
        userType: res.locals.user.userType
      });
    }
    
    res.render('index', {
      title: 'BidHive - Social Marketplace for Collectibles',
      description: 'Buy, sell, and negotiate prices on collectible items',
      listings: listings,
      listingsCount: listings.length,
      user: null,
      userType: null
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.render('index', {
      title: 'BidHive - Social Marketplace for Collectibles',
      description: 'Buy, sell, and negotiate prices on collectible items',
      listings: [],
      listingsCount: 0,
      user: res.locals.user || null,
      userType: res.locals.user?.userType || null
    });
  }
});

// Dashboard
app.get('/dashboard', requireAuth, (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  if (user?.userType === 'seller') {
    return res.redirect('/seller/dashboard');
  } else if (user?.userType === 'buyer') {
    return res.redirect('/');
  }
  
  res.render('dashboard', {
    title: 'Dashboard - BidHive',
    description: 'Buy, sell, and negotiate prices on collectible items',
    user: user
  });
});

// Browse page
app.get('/browse', requireAuth, (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  if (user?.userType !== 'buyer') {
    return res.redirect('/');
  }
  
  res.render('browser', {
    title: 'Browse Items - BidHive',
    description: 'Browse and shop items on BidHive',
    user: user,
    userType: 'buyer',
    currentPath: '/browse'
  });
});

// Seller dashboard
app.get('/seller/dashboard', requireAuth, (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  console.log('Seller dashboard - User data:', user);
  
  if (!user) {
    return res.redirect('/login');
  }
  
  if (user.userType !== 'seller') {
    return res.redirect('/dashboard');
  }
  
  const userForTemplate = {
    id: user.id,
    name: user.name || user.username,
    email: user.email,
    userType: user.userType,
    username: user.username
  };
  
  res.render('seller-dashboard', {
    title: 'Seller Dashboard - BidHive',
    user: userForTemplate,
    userType: 'seller',
    description: 'Buy, sell, and negotiate prices on collectible items',
  });
});

// Login page
app.get('/login', redirectIfAuthenticated, (req: CustomRequest, res: Response) => {
  const redirectUrl = req.query.redirect || '/';
  
  res.render('login', {
    title: 'Login - BidHive',
    description: 'Login to your BidHive account',
    redirectUrl: redirectUrl,
    showSocialLogin: true,
    socialProviders: ['google', 'github'],
    enableDemoLogin: process.env.NODE_ENV === 'development',
    demoCredentials: {
      email: 'demo@bidhive.com',
      password: 'demo123'
    },
    user: null
  });
});

// Register page
app.get('/register', redirectIfAuthenticated, (req: CustomRequest, res: Response) => {
  res.render('register', {
    title: 'Register - BidHive',
    description: 'Create a new BidHive account',
    user: null
  });
});

// Logout
app.get('/logout', (req: CustomRequest, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

// Profile page
app.get('/profile', requireAuth, async (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  if (!user) {
    return res.redirect('/login');
  }
  
  res.render('profile', {
    title: 'Profile - BidHive',
    description: 'Manage your account settings',
    user: user,
    currentPath: '/profile'
  });
});

// Seller chats
app.get('/seller/chats', requireAuth, (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  if (!user) {
    return res.redirect('/login');
  }
  
  if (user.userType !== 'seller') {
    return res.redirect('/dashboard');
  }
  
  res.render('seller-chat', {
    title: 'Seller Chat Center - BidHive',
    description: 'Manage conversations with buyers',
    user: user,
    currentPath: '/seller/chats'
  });
});

// ============================================
// 8. API ROUTES
// ============================================

// Session check endpoint
app.get('/api/check-session', (req: CustomRequest, res: Response) => {
  console.log('🔍 Session check - ID:', req.session?.id);
  console.log('🔍 Session check - UserId:', req.session?.userId);
  console.log('🔍 Cookies received:', req.headers.cookie);
  
  if (req.session?.userId) {
    res.json({ 
      authenticated: true, 
      userId: req.session.userId,
      user: req.session.user,
      sessionId: req.session.id
    });
  } else {
    res.json({ 
      authenticated: false,
      sessionId: req.session?.id,
      message: 'No user in session'
    });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    storage: 'JSON files',
    sessions: 'File-based'
  });
});

// API routers
app.use('/api/items', itemsRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);

// Debug route (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/debug/session', (req: CustomRequest, res: Response) => {
    res.json({
      sessionId: req.session?.id,
      userId: req.session?.userId,
      sessionData: req.session
    });
  });
}

// ============================================
// 9. ERROR HANDLERS (MUST BE LAST)
// ============================================

// Error handling middleware
app.use(errorHandler);

// 404 handler - Catch all unmatched routes
app.use((req: CustomRequest, res: Response) => {
  // API endpoints
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  }
  
  // Static assets
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.map'];
  const isStaticAsset = staticExtensions.some(ext => req.path.endsWith(ext));
  
  if (isStaticAsset) {
    return res.status(404).sendFile(path.join(__dirname, '../public/404-asset.html'), (err) => {
      if (err) {
        res.status(404).send('Asset not found');
      }
    });
  }
  
  // HTML pages
  const user = res.locals.user || null;
  
  res.status(404).render('404', {
    title: 'Page Not Found - BidHive',
    description: 'The page you are looking for does not exist',
    user: user,
    currentPath: req.path,
    requestedPath: req.path
  });
});

// ============================================
// 10. SERVER STARTUP
// ============================================
const server = createServer(app);
setupWebSocketServer(server);

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`WebSocket server ready for real-time chat`);
  console.log(`Session storage: ${sessionsDir}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});