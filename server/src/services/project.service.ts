import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { Prisma } from '@prisma/client';
import { CreateProjectInput, UpdateProjectInput, ProjectFilters } from '../schemas/project.schema.js';

export const getProjects = async (userId: string, filters: ProjectFilters) => {
  const where: Prisma.ProjectWhereInput = { userId };
  
  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }
  
  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

export const getProjectById = async (id: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: { id, userId },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};

export const createProject = async (userId: string, data: CreateProjectInput) => {
  return prisma.project.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
    },
  });
};

export const updateProject = async (id: string, userId: string, data: UpdateProjectInput) => {
  const project = await getProjectById(id, userId);

  // Partial edits must also respect the date that is already stored.
  const startDate = data.startDate === undefined ? project.startDate : data.startDate;
  const endDate = data.endDate === undefined ? project.endDate : data.endDate;
  if (startDate && endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
    throw new AppError('End date must not be earlier than start date', 400);
  }

  return prisma.project.update({
    where: { id: project.id, userId },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
    },
  });
};

export const deleteProject = async (id: string, userId: string) => {
  const project = await getProjectById(id, userId);

  await prisma.project.delete({
    where: { id: project.id, userId },
  });
};
