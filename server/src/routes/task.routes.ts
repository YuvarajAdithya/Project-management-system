import { Router } from 'express';
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from '../controllers/task.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createTaskSchema, updateTaskSchema, taskFiltersSchema } from '../schemas/task.schema.js';
import { idParamsSchema } from '../schemas/common.schema.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', validate(taskFiltersSchema, 'query'), getTasks);
router.get('/:id', validate(idParamsSchema, 'params'), getTaskById);
router.post('/', validate(createTaskSchema), createTask);
router.put('/:id', validate(idParamsSchema, 'params'), validate(updateTaskSchema), updateTask);
router.delete('/:id', validate(idParamsSchema, 'params'), deleteTask);

export default router;
