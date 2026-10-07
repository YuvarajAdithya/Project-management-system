import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';
import { z } from 'zod';

export const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as string & SignOptions['expiresIn'],
  };
  return jwt.sign({ userId }, config.jwtSecret, options);
};

export const verifyToken = (token: string): { userId: string } => {
  const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  // A verified signature alone must not allow a missing owner filter in Prisma.
  return z.object({ userId: z.string().uuid() }).parse(payload);
};
