import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET || 'supersecret';

export function generateToken(payload: object, expiresIn: string = '1h'): string {
  const options: SignOptions = { expiresIn: 3600 }; 
  return jwt.sign(payload, SECRET, options);
}

export function verifyToken(token: string): any {
  return jwt.verify(token, SECRET);
}
