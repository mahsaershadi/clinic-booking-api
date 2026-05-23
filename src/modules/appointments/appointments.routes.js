import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import * as appointmentsController from './appointments.controller.js';
import {
  createAppointmentSchema,
  appointmentIdSchema,
} from './appointments.validation.js';

const router = Router();

//creating appointment route
router.post(
  '/',
  authMiddleware,
  roleMiddleware('PATIENT', 'ADMIN'),
  validate(createAppointmentSchema),
  asyncHandler(appointmentsController.createAppointment)
);

//seeing appontment
router.get(
  '/my',
  authMiddleware,
  roleMiddleware('PATIENT', 'DOCTOR', 'ADMIN'),
  asyncHandler(appointmentsController.getMyAppointments)
);

//cancelling appointment
router.patch(
  '/:id/cancel',
  authMiddleware,
  roleMiddleware('PATIENT', 'ADMIN'),
  validate(appointmentIdSchema),
  asyncHandler(appointmentsController.cancelAppointment)
);

router.patch(
  '/:id/complete',
  authMiddleware,
  roleMiddleware('DOCTOR', 'ADMIN'),
  validate(appointmentIdSchema),
  asyncHandler(appointmentsController.completeAppointment)
);

export default router;
