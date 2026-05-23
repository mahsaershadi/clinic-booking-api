import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

//creating doctor by admin
export const createDoctorSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(2, 'Full name must be at least 2 characters'),
      email: z.email('Invalid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
      specialization: z.string().min(2, 'Specialization is required'),
      workStart: z.string().regex(timeRegex, 'workStart must be in HH:MM format (24h)'),
      workEnd: z.string().regex(timeRegex, 'workEnd must be in HH:MM format (24h)'),
    })
    .refine((data) => data.workStart < data.workEnd, {
      message: 'workEnd must be after workStart',
      path: ['workEnd'],
    }),
});
