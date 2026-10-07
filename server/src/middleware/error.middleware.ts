import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: { field: string; message: string }[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((error) => ({ field: error.path.join('.'), message: error.message }));
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid request data';
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = 'A record with these details already exists';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2000':
      case 'P2003':
      case 'P2006':
      case 'P2007':
      case 'P2011':
      case 'P2012':
      case 'P2014':
      case 'P2023':
        statusCode = 400;
        message = 'Invalid request data';
        break;
      case 'P2024':
      case 'P2037':
        statusCode = 503;
        message = 'Service temporarily unavailable';
        break;
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = 'Service temporarily unavailable';
  } else if ('type' in err && err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON body';
  } else if ('type' in err && err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  }

  if (statusCode >= 500 && config.nodeEnv === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
    ...(errors && { errors }),
  });
};
