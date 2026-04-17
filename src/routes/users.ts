import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// In-memory user storage
const users: any[] = [];

const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

router.post('/login', (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hashedPassword = hashPassword(password);
    let user = users.find(u => u.name.toLowerCase() === name.trim().toLowerCase());

    if (!user) {
      user = {
        id: Date.now().toString(),
        name: name.trim(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      users.push(user);
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ ...userWithoutPassword, isNewUser: true });
    } else {
      if (user.password !== hashedPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      user.lastLogin = new Date().toISOString();
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ ...userWithoutPassword, isNewUser: false });
    }
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (!password || password.length < 3) {
      return res.status(400).json({ error: 'Password must be at least 3 characters' });
    }

    const existingUser = users.find(u => u.name.toLowerCase() === name.trim().toLowerCase());

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const hashedPassword = hashPassword(password);
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

router.get('/', (req: Request, res: Response) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

router.get('/:id', (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

export default router;