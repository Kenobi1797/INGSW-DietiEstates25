import { Request, Response, NextFunction } from 'express';

interface HttpError {
  status?: number;
  statusCode?: number;
  message?: string;
  stack?: string;
}

export function errorMiddleware(err: HttpError, req: Request, res: Response, next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Errore interno del server';
  console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${message}`, err.stack || '');
  res.status(status).json({ error: message });
}
