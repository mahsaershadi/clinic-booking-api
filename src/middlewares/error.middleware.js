import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const errorMiddleware = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'This appointment slot is already booked for the doctor',
    });
  }

  if (env.nodeEnv === 'development') {
    console.error(err);
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
