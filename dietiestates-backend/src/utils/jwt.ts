import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET || 'supersecret';

export function generateToken(payload: object, expiresIn: string = process.env.JWT_EXPIRES_IN || '7d'): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, SECRET, options);
}

export function verifyToken(token: string): any {
  return jwt.verify(token, SECRET);
}
