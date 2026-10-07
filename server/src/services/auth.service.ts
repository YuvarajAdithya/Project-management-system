import bcrypt from 'bcrypt';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { generateToken } from '../utils/jwt.js';
import { RegisterInput } from '../schemas/auth.schema.js';

export const register = async (data: RegisterInput) => {
  const email = data.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName.trim(),
      email,
      passwordHash,
    },
    select: { id: true, fullName: true, email: true, createdAt: true },
  });

  const token = generateToken(user.id);

  return { token, user };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(user.id);
  const userWithoutPassword = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
  };

  return { token, user: userWithoutPassword };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true, createdAt: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};
