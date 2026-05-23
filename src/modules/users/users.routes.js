import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import * as usersController from './users.controller.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  asyncHandler(usersController.listUsers)
);

export default router;
