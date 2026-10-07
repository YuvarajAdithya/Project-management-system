import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service.js';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const stats = await dashboardService.getDashboardStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
