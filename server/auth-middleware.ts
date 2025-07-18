import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { storage } from './storage';

// Extend Express Request to include admin user
declare global {
  namespace Express {
    interface Request {
      adminUser?: {
        id: number;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const requireAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(401).json({ error: 'Username and password required' });
    }

    const adminUser = await storage.getAdminUserByUsername(username);
    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await verifyPassword(password, adminUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await storage.updateAdminLastLogin(adminUser.id);

    req.adminUser = {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const verifyAdminToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, we'll use a simple session-based approach
    // In a production environment, you'd use JWT tokens
    const adminId = req.headers['x-admin-id'];
    
    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const adminUser = await storage.getAdminUser(Number(adminId));
    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid admin session' });
    }

    req.adminUser = {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
    };

    next();
  } catch (error) {
    console.error('Admin token verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};