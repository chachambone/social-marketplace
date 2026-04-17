import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import itemsRouter from './routes/items.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup - pointing to src/views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views/pages'));

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Social Marketplace - Collectible Trading Post',
    description: 'Buy, sell, and negotiate prices on collectible items'
  });
});

// Direct items endpoint to read from JSON file
app.get('/api/items', (req, res) => {
  try {
    // Try multiple possible paths for items.json - PRIORITIZING src/data/
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'data', 'items.json'),   // root/src/data/items.json (YOUR CURRENT LOCATION)
      path.join(__dirname, 'data', 'items.json'),              // src/data/items.json (from dist)
      // path.join(process.cwd(), 'data', 'items.json'),          // root/data/items.json
      // path.join(__dirname, '../data', 'items.json'),           // relative to dist
      // path.join(__dirname, '../../data', 'items.json'),        // one level up from dist
    ];
    console.log("possiblePaths for items.json:", possiblePaths);
    let itemsData = null;
    let usedPath = '';
    
    for (const itemsPath of possiblePaths) {
      if (fs.existsSync(itemsPath)) {
        itemsData = fs.readFileSync(itemsPath, 'utf-8');
        usedPath = itemsPath;
        break;
      }
    }
    
    if (!itemsData) {
      console.error('❌ items.json not found in any path');
      return res.json([]);
    }
    
    const items = JSON.parse(itemsData);
    console.log(`✅ Loaded ${items.length} items from ${usedPath}`);
    res.json(items);
  } catch (error) {
    console.error('Error reading items:', error);
    res.json([]);
  }
});

// API routes
app.use('/api/items-router', itemsRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});