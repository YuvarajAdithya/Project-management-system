import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createProjectSchema, updateProjectSchema, projectFiltersSchema } from '../schemas/project.schema.js';
import { idParamsSchema } from '../schemas/common.schema.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(projectFiltersSchema, 'query'), getProjects);
router.get('/:id', validate(idParamsSchema, 'params'), getProjectById);
router.post('/', validate(createProjectSchema), createProject);
router.put('/:id', validate(idParamsSchema, 'params'), validate(updateProjectSchema), updateProject);
router.delete('/:id', validate(idParamsSchema, 'params'), deleteProject);

export default router;
