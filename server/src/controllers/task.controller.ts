import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/task.service.js';
import { TaskStatus, Priority } from '@prisma/client';

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const filters = {
      projectId: req.query.projectId as string | undefined,
      search: req.query.search as string | undefined,
      status: req.query.status as TaskStatus | undefined,
      priority: req.query.priority as Priority | undefined,
    };
    const tasks = await taskService.getTasks(userId, filters);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const task = await taskService.getTaskById(req.params.id as string, userId);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const task = await taskService.createTask(userId, req.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const task = await taskService.updateTask(req.params.id as string, userId, req.body);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    await taskService.deleteTask(req.params.id as string, userId);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
