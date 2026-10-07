import { z } from 'zod';
import { TaskStatus, Priority } from '@prisma/client';
import { optionalDateTime, optionalFilter, searchFilter } from './common.schema.js';

export const createTaskSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  name: z.string().trim().min(1, 'Task name is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: optionalDateTime,
}).strict();

export const updateTaskSchema = createTaskSchema.partial();

export const taskFiltersSchema = z.object({
  projectId: optionalFilter(z.string().uuid('Invalid project ID')),
  search: searchFilter,
  status: optionalFilter(z.nativeEnum(TaskStatus)),
  priority: optionalFilter(z.nativeEnum(Priority)),
}).strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
