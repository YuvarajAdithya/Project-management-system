import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Replace the original input so transforms and allowed fields reach services.
      req[source] = schema.parse(req[source]);
      next();
    } catch (error) {
      next(error);
    }
  };
};
