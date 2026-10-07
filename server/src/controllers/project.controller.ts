import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/project.service.js';
import { ProjectStatus } from '@prisma/client';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const filters = {
      search: req.query.search as string | undefined,
      status: req.query.status as ProjectStatus | undefined,
    };
    const projects = await projectService.getProjects(userId, filters);
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const project = await projectService.getProjectById(req.params.id as string, userId);
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const project = await projectService.createProject(userId, req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const project = await projectService.updateProject(req.params.id as string, userId, req.body);
    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    await projectService.deleteProject(req.params.id as string, userId);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};
