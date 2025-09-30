import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token mancante' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token mancante' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token non valido' });
  }
}

export function roleMiddleware(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.ruolo)) {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    next();
  };
}
