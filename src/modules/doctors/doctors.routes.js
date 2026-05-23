import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as doctorsController from './doctors.controller.js';
import { createDoctorSchema } from './doctors.validation.js';

const router = Router();

//get all the docotrs
router.get('/', authMiddleware, asyncHandler(doctorsController.listDoctors));

//adding doctor
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(createDoctorSchema),
  asyncHandler(doctorsController.createDoctor)
);

export default router;
