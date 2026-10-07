import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';
import { optionalDateTime, optionalFilter, searchFilter } from './common.schema.js';

const projectBodySchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: optionalDateTime,
  endDate: optionalDateTime,
}).strict();

const validDateOrder = (data: { startDate?: string | null; endDate?: string | null }) =>
  !data.startDate || !data.endDate || Date.parse(data.endDate) >= Date.parse(data.startDate);

const dateOrderError = { message: 'End date must not be earlier than start date', path: ['endDate'] };

export const createProjectSchema = projectBodySchema.refine(validDateOrder, dateOrderError);
export const updateProjectSchema = projectBodySchema.partial().refine(validDateOrder, dateOrderError);

export const projectFiltersSchema = z.object({
  search: searchFilter,
  status: optionalFilter(z.nativeEnum(ProjectStatus)),
}).strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilters = z.infer<typeof projectFiltersSchema>;
