import { z } from 'zod';

export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.coerce.number().int().positive('doctorId must be a positive integer'),
    startTime: z.iso.datetime({ message: 'startTime must be a valid ISO 8601 datetime' }),
  }),
});

export const appointmentIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Appointment id must be a positive integer'),
  }),
});
