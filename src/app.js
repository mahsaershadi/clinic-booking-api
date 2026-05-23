import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './modules/auth/auth.routes.js';
import doctorsRoutes from './modules/doctors/doctors.routes.js';
import appointmentsRoutes from './modules/appointments/appointments.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Clinic Booking API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/users', usersRoutes);

app.use((_req, _res, next) => {
  next(new AppError('Route not found', 404));
});

app.use(errorMiddleware);

export default app;
