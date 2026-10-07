import dotenv from 'dotenv';
import { isIP } from 'node:net';
dotenv.config();

const parseTrustProxy = (value: string | undefined): false | string[] => {
  if (!value || value.trim().toLowerCase() === 'false') return false;

  const trusted = value.split(',').map((entry) => entry.trim());
  const aliases = new Set(['loopback', 'linklocal', 'uniquelocal']);
  for (const entry of trusted) {
    if (aliases.has(entry)) continue;
    const [address, prefix, ...extra] = entry.split('/');
    const version = isIP(address);
    const maxPrefix = version === 4 ? 32 : 128;
    if (!version || extra.length || (prefix !== undefined && (
      !/^\d+$/.test(prefix) || Number(prefix) < 1 || Number(prefix) > maxPrefix
    ))) {
      throw new Error('TRUST_PROXY must contain trusted IP addresses, CIDRs, or Express subnet names; blanket trust and hop counts are not allowed');
    }
  }
  return trusted;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const defaultJwtSecret = 'your-super-secret-jwt-key-change-this';
const jwtSecret = process.env.JWT_SECRET || defaultJwtSecret;
if (nodeEnv === 'production' && (jwtSecret === defaultJwtSecret || jwtSecret.trim().length < 32)) {
  throw new Error('Set a unique JWT_SECRET of at least 32 characters in production');
}

export const config = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taskflow',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv,
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
};
