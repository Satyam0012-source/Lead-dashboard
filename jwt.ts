import jwt from 'jsonwebtoken';
import { AuthPayload, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (userId: string, role: UserRole): string => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): AuthPayload => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
};
