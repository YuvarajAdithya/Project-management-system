import { prisma } from '../config/database.js';

export const getDashboardStats = async (userId: string) => {
  const totalProjects = await prisma.project.count({ where: { userId } });
  
  const projectsInProgress = await prisma.project.count({
    where: { userId, status: 'IN_PROGRESS' },
  });

  const totalTasks = await prisma.task.count({
    where: { project: { userId } },
  });

  const completedTasks = await prisma.task.count({
    where: { project: { userId }, status: 'COMPLETED' },
  });

  const pendingTasks = await prisma.task.count({
    where: { project: { userId }, status: 'PENDING' },
  });

  return {
    totalProjects,
    projectsInProgress,
    totalTasks,
    completedTasks,
    pendingTasks,
  };
};
