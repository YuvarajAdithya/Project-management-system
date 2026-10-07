import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { Prisma } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput, TaskFilters } from '../schemas/task.schema.js';

export const getTasks = async (userId: string, filters: TaskFilters) => {
  const where: Prisma.TaskWhereInput = {
    project: { userId },
  };

  if (filters.projectId) {
    where.projectId = filters.projectId;
  }
  
  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }
  
  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  return prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

export const getTaskById = async (id: string, userId: string) => {
  const task = await prisma.task.findFirst({
    where: {
      id,
      project: { userId },
    },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task;
};

const getOwnedProject = async (projectId: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  return project;
};

export const createTask = async (userId: string, data: CreateTaskInput) => {
  const project = await getOwnedProject(data.projectId, userId);

  return prisma.task.create({
    data: {
      projectId: project.id,
      name: data.name,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
    },
  });
};

export const updateTask = async (id: string, userId: string, data: UpdateTaskInput) => {
  const task = await getTaskById(id, userId);

  if (data.projectId !== undefined) {
    await getOwnedProject(data.projectId, userId);
  }

  return prisma.task.update({
    where: { id: task.id, project: { userId } },
    data: {
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
    },
  });
};

export const deleteTask = async (id: string, userId: string) => {
  const task = await getTaskById(id, userId);

  await prisma.task.delete({
    where: { id: task.id, project: { userId } },
  });
};
