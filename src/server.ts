// main server file - CORRECTED ORDER
import 'express-session';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import FileStore from 'session-file-store';

// Extend session data interface BEFORE using it
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

// Extend Express Request type
interface CustomRequest extends Request {
  session: session.Session & Partial<session.SessionData>;
}

// Rest of imports
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import itemsRouter from './routes/items.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import { setupWebSocketServer } from './webserver.js';
import { getCurrentUser } from './utils/auth.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// Initialize file session store
const FileStoreSession = FileStore(session);

// Create sessions directory
import fs from 'fs';
const sessionsDir = path.join(__dirname, '../sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

// MIDDLEWARE - Order matters!

// 1. CORS (only once)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: new FileStoreSession({
    path: sessionsDir,
    ttl: 7 * 24 * 60 * 60,
    reapInterval: 60 * 60,
    retries: 3,
    logFn: function() {}
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    ...(process.env.NODE_ENV !== 'production' && { secure: false })
  },
  name: 'bidnest.sid'
}));

// 4. Debug logging middleware
app.use((req: CustomRequest, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Session ID:', req.session.id);
  console.log('Session UserId:', req.session.userId);
  next();
});

// 5. User middleware (makes user available to templates)
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

// 6. Request logger
app.use(requestLogger);

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../src/assets')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, '../src/views/pages'),
  path.join(__dirname, '../src/views/components')
]);

// Auth middleware
const requireAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

const redirectIfAuthenticated = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  next();
};

// ROUTES

// Home page - serves different content based on user type
app.get('/', async (req: CustomRequest, res: Response) => {
  try {
    const apiUrl = process.env.API_URL || `http://localhost:${PORT}`;
    const response = await fetch(`${apiUrl}/api/items`);
    const data = await response.json();
    const listings = data.items || data || [];
    
    // If user is logged in, pass user data to template
    if (req.session.userId && res.locals.user) {
      return res.render('index', {
        title: 'BidNest - Social Marketplace for Collectibles',
        description: 'Buy, sell, and negotiate prices on collectible items',
        listings: listings,
        listingsCount: listings.length,
        user: res.locals.user,
        userType: res.locals.user.userType
      });
    }
    
    // Not logged in
    res.render('index', {
      title: 'BidNest - Social Marketplace for Collectibles',
      description: 'Buy, sell, and negotiate prices on collectible items',
      listings: listings,
      listingsCount: listings.length,
      user: null,
      userType: null
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.render('index', {
      title: 'BidNest - Social Marketplace for Collectibles',
      description: 'Buy, sell, and negotiate prices on collectible items',
      listings: [],
      listingsCount: 0,
      user: res.locals.user || null,
      userType: res.locals.user?.userType || null
    });
  }
});

// Dashboard - role-based redirect
app.get('/dashboard', requireAuth, (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  // Redirect based on user type
  if (user?.userType === 'seller') {
    return res.redirect('/seller/dashboard');
  } else if (user?.userType === 'buyer') {
    return res.redirect('/');
  }
  
  // Default fallback
  res.render('dashboard', {
    title: 'Dashboard - BidNest',
    user: user
  });
});


app.get('/browse', requireAuth, (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  if (user?.userType !== 'buyer') {
    return res.redirect('/');
  }
  
  res.render('browser', {
    title: 'Browse Items - BidNest',
    description: 'Browse and shop items on BidNest',
    user: user,
    userType: 'buyer',
    currentPath: '/browse'
  });
});

// Seller dashboard
// Seller dashboard route
app.get('/seller/dashboard', requireAuth, (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  console.log('Seller dashboard - User data:', user);
  
  if (!user) {
    return res.redirect('/login');
  }
  
  if (user.userType !== 'seller') {
    return res.redirect('/dashboard');
  }
  
  // Ensure all required fields are present
  const userForTemplate = {
    id: user.id,
    name: user.name || user.username,
    email: user.email,
    userType: user.userType,
    username: user.username
  };
  
  res.render('seller-dashboard', {
    title: 'Seller Dashboard - BidNest',
    user: userForTemplate,
    userType: 'seller'
  });
});

// Buyer dashboard
app.get('browse', requireAuth, (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  if (user?.userType !== 'buyer') {
    return res.redirect('/');
  }
  
  res.render('browser', {
    title: 'BidNest',
    user: user,
    userType: 'buyer'
  });
});

// Login page
app.get('/login', redirectIfAuthenticated, (req: CustomRequest, res: Response) => {
  const redirectUrl = req.query.redirect || '/';
  
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
    },
    user: null
  });
});

// Register page
app.get('/register', redirectIfAuthenticated, (req: CustomRequest, res: Response) => {
  res.render('register', {
    title: 'Register - BidNest',
    description: 'Create a new BidNest account',
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

app.get('/profile', requireAuth, async (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  if (!user) {
    return res.redirect('/login');
  }
  
  res.render('profile', {
    title: 'Profile - BidNest',
    description: 'Manage your account settings',
    user: user,
    currentPath: '/profile'
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

// Debug route
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

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time chat`);
  console.log(`💾 Session storage: ${sessionsDir}`);
});