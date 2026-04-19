import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';

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
const PORT = parseInt(process.env.PORT || '3000', 10); // Convert to number
const HOST = '0.0.0.0';

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/bidnest',
    ttl: 7 * 24 * 60 * 60, // 7 days
    autoRemove: 'native'
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
    const response = await fetch(`${process.env.API_URL || 'http://localhost:3000'}/api/items`);
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
  // Get redirect URL from query params
  const redirectUrl = req.query.redirect || '/dashboard';
  
  // Prepare component configuration
  const componentConfig = {
    components: [
      { 
        fileName: 'LoginForm.js', 
        componentName: 'LoginForm',
        customName: 'login-form',
        props: {
          redirectUrl: redirectUrl,
          showRegister: false,
          theme: 'default'
        },
        events: {
          'login-success': 'onLoginSuccess',
          'register-success': 'onRegisterSuccess',
          'login-error': 'onLoginError'
        }
      }
    ],
    basePath: process.env.ASSET_BASE_PATH || '/',
    debug: process.env.NODE_ENV === 'development',
    autoLoad: true,
    containerClass: 'bg-white rounded-2xl shadow-xl p-8 animate-slideInRight',
    loadingText: 'Loading authentication form...',
    customHandlers: {
      onLoginSuccess: (e) => {
        console.log('Login success:', e.detail);
      },
      onRegisterSuccess: (e) => {
        console.log('Register success:', e.detail);
      },
      onLoginError: (e) => {
        console.log('Login error:', e.detail);
      }
    }
  };
  
  // Also pass any additional data needed for the page
  const pageData = {
    title: 'Login - BidNest',
    description: 'Login to your BidNest account',
    showSocialLogin: true,
    socialProviders: ['google', 'github', 'facebook'],
    enableDemoLogin: process.env.NODE_ENV === 'development',
    demoCredentials: {
      email: 'demo@bidnest.com',
      password: 'demo123'
    }
  };
  
  res.render('login', {
    ...pageData,
    componentConfig: componentConfig,
    redirectUrl: redirectUrl
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
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Create HTTP server and attach WebSocket
const server = createServer(app);
setupWebSocketServer(server);

// Bind to 0.0.0.0 to ensure Render can detect the port
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time chat`);
});