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

// Also add Express namespace augmentation
declare global {
  namespace Express {
    interface Request {
      session: session.Session & Partial<session.SessionData>;
    }
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

// 3. Session middleware - FIXED for production
const isProduction = process.env.NODE_ENV === 'production';

// Create sessions directory with absolute path
const sessionsDir = path.join(process.cwd(), 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
  console.log(`📁 Created sessions directory: ${sessionsDir}`);
}

// Verify write permissions
try {
  fs.accessSync(sessionsDir, fs.constants.W_OK);
  console.log(`✅ Sessions directory is writable: ${sessionsDir}`);
} catch (err) {
  console.error(`❌ Sessions directory is NOT writable: ${sessionsDir}`, err);
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false, // Changed to false to prevent empty sessions
  store: new FileStoreSession({
    path: sessionsDir,
    ttl: 7 * 24 * 60 * 60, // 7 days
    reapInterval: 60 * 60, // 1 hour
    retries: 3,
    logFn: function(msg) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[SessionStore] ${msg}`);
      }
    }
  }),
  cookie: {
    secure: isProduction, // Must be true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    domain: isProduction ? '.onrender.com' : undefined // Important for Render
  },
  name: 'bidhive.sid',
  proxy: true, // Important for Render behind proxy
  rolling: true // Reset cookie expiration on each response
}));

// Add session debugging middleware
app.use((req: CustomRequest, res: Response, next: NextFunction) => {
  const oldSessionSave = req.session.save;
  req.session.save = function(callback) {
    console.log(`💾 Saving session ID: ${this.id}, UserId: ${this.userId}`);
    return oldSessionSave.call(this, callback);
  };
  next();
});

// 4. Debug logging middleware
app.use((req: CustomRequest, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Session ID:', req.session.id);
  console.log('Session is ===== :', req.session);
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
    const apiUrl = process.env.APP_URL ;
    const response = await fetch(`${apiUrl}/api/items`);
    const data = await response.json();
    const listings = data.items || data || [];
    
    // If user is logged in, pass user data to template
    if (req.session.userId && res.locals.user) {
      return res.render('index', {
        title: 'BidHive - Social Marketplace for Collectibles',
        description: 'Buy, sell, and negotiate prices on collectible items',
        listings: listings,
        listingsCount: listings.length,
        user: res.locals.user,
        userType: res.locals.user.userType
      });
    }
    
    // Not logged in
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
    title: 'Dashboard - BidHive',
    description: 'Buy, sell, and negotiate prices on collectible items',
    user: user
  });
});


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
    title: 'Seller Dashboard - BidHive',
    user: userForTemplate,
    userType: 'seller',
    description: 'Buy, sell, and negotiate prices on collectible items',

  });
});

// Buyer dashboard
app.get('browse', requireAuth, (req: CustomRequest, res: Response) => {
  const user = res.locals.user;
  
  if (user?.userType !== 'buyer') {
    return res.redirect('/');
  }
  
  res.render('browser', {
    title: 'BidHive',
    user: user,
    userType: 'buyer'
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


app.use((req: CustomRequest, res: Response) => {
  // Check if the request is for an API endpoint
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  }
  
  // Check if the request is for a static asset
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.map'];
  const isStaticAsset = staticExtensions.some(ext => req.path.endsWith(ext));
  
  if (isStaticAsset) {
    return res.status(404).sendFile(path.join(__dirname, '../public/404-asset.html'), (err) => {
      if (err) {
        res.status(404).send('Asset not found');
      }
    });
  }
  
  // For HTML pages, render a nice 404 page
  const user = res.locals.user || null;
  
  res.status(404).render('404', {
    title: 'Page Not Found - BidHive',
    description: 'The page you are looking for does not exist',
    user: user,
    currentPath: req.path,
    requestedPath: req.path
  });
});


// Create HTTP server and attach WebSocket
const server = createServer(app);
setupWebSocketServer(server);

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`WebSocket server ready for real-time chat`);
  console.log(`Session storage: ${sessionsDir}`);
});