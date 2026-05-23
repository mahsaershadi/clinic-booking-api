import { pool } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import {
  getAppointmentEndTime,
  isValidSlotMinutes,
  isFutureDateTime,
  canCancelAppointment,
  isWithinWorkingHours,
} from '../../utils/time.js';
import { getDoctorById } from '../doctors/doctors.service.js';

const formatAppointment = (row) => ({
  id: row.id,
  doctorId: row.doctor_id,
  patientId: row.patient_id,
  startTime: row.start_time,
  endTime: row.end_time,
  status: row.status,
  createdAt: row.created_at,
  doctorName: row.doctor_name ?? undefined,
  patientName: row.patient_name ?? undefined,
  specialization: row.specialization ?? undefined,
});

const validateBookingRules = (startTime, doctor) => {
  if (!isFutureDateTime(startTime)) {
    throw new AppError('Appointment must be scheduled in the future', 400);
  }

  if (!isValidSlotMinutes(startTime)) {
    throw new AppError('Appointment start time must be on the hour or half-hour (e.g. 08:00, 08:30)', 400);
  }

  const workStart =
    typeof doctor.workStart === 'string'
      ? doctor.workStart.slice(0, 5)
      : doctor.workStart;
  const workEnd =
    typeof doctor.workEnd === 'string' ? doctor.workEnd.slice(0, 5) : doctor.workEnd;

  if (!isWithinWorkingHours(startTime, workStart, workEnd)) {
    throw new AppError('Appointment must be within the doctor working hours', 400);
  }
};

export const createAppointment = async (patientId, { doctorId, startTime }) => {
  const doctor = await getDoctorById(doctorId);
  const appointmentStart = new Date(startTime);

  validateBookingRules(appointmentStart, doctor);

  const appointmentEnd = getAppointmentEndTime(appointmentStart);

  const result = await pool.query(
    `INSERT INTO appointments (doctor_id, patient_id, start_time, end_time, status)
     VALUES ($1, $2, $3, $4, 'RESERVED')
     RETURNING id, doctor_id, patient_id, start_time, end_time, status, created_at`,
    [doctorId, patientId, appointmentStart.toISOString(), appointmentEnd.toISOString()]
  );

  return formatAppointment(result.rows[0]);
};

export const getMyAppointments = async (user) => {
  if (user.role === 'ADMIN') {
    const result = await pool.query(
      `SELECT a.id, a.doctor_id, a.patient_id, a.start_time, a.end_time, a.status, a.created_at,
              du.full_name AS doctor_name,
              pu.full_name AS patient_name,
              d.specialization
       FROM appointments a
       INNER JOIN doctors d ON d.id = a.doctor_id
       INNER JOIN users du ON du.id = d.user_id
       INNER JOIN users pu ON pu.id = a.patient_id
       ORDER BY a.start_time DESC`
    );
    return result.rows.map(formatAppointment);
  }

  if (user.role === 'DOCTOR') {
    if (!user.doctorId) {
      throw new AppError('Doctor profile not found', 404);
    }

    const result = await pool.query(
      `SELECT a.id, a.doctor_id, a.patient_id, a.start_time, a.end_time, a.status, a.created_at,
              pu.full_name AS patient_name
       FROM appointments a
       INNER JOIN users pu ON pu.id = a.patient_id
       WHERE a.doctor_id = $1
       ORDER BY a.start_time DESC`,
      [user.doctorId]
    );
    return result.rows.map(formatAppointment);
  }

  const result = await pool.query(
    `SELECT a.id, a.doctor_id, a.patient_id, a.start_time, a.end_time, a.status, a.created_at,
            du.full_name AS doctor_name,
            d.specialization
     FROM appointments a
     INNER JOIN doctors d ON d.id = a.doctor_id
     INNER JOIN users du ON du.id = d.user_id
     WHERE a.patient_id = $1
     ORDER BY a.start_time DESC`,
    [user.id]
  );

  return result.rows.map(formatAppointment);
};

export const cancelAppointment = async (appointmentId, user) => {
  const result = await pool.query(
    `SELECT a.id, a.doctor_id, a.patient_id, a.start_time, a.end_time, a.status, a.created_at
     FROM appointments a
     WHERE a.id = $1`,
    [appointmentId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Appointment not found', 404);
  }

  const appointment = result.rows[0];

  if (user.role !== 'ADMIN' && appointment.patient_id !== user.id) {
    throw new AppError('You can only cancel your own appointments', 403);
  }

  if (appointment.status !== 'RESERVED') {
    throw new AppError('Only reserved appointments can be cancelled', 400);
  }

  const startTime = new Date(appointment.start_time);

  if (user.role === 'PATIENT' && !canCancelAppointment(startTime)) {
    throw new AppError(
      'Appointments can only be cancelled at least 2 hours before the start time',
      400
    );
  }

  const updated = await pool.query(
    `UPDATE appointments
     SET status = 'CANCELLED'
     WHERE id = $1
     RETURNING id, doctor_id, patient_id, start_time, end_time, status, created_at`,
    [appointmentId]
  );

  return formatAppointment(updated.rows[0]);
};

export const completeAppointment = async (appointmentId, user) => {
  const result = await pool.query(
    `SELECT a.id, a.doctor_id, a.patient_id, a.start_time, a.end_time, a.status, a.created_at
     FROM appointments a
     WHERE a.id = $1`,
    [appointmentId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Appointment not found', 404);
  }

  const appointment = result.rows[0];

  if (user.role === 'DOCTOR' && appointment.doctor_id !== user.doctorId) {
    throw new AppError('You can only complete your own appointments', 403);
  }

  if (appointment.status !== 'RESERVED') {
    throw new AppError('Only reserved appointments can be marked as completed', 400);
  }

  const updated = await pool.query(
    `UPDATE appointments
     SET status = 'COMPLETED'
     WHERE id = $1
     RETURNING id, doctor_id, patient_id, start_time, end_time, status, created_at`,
    [appointmentId]
  );

  return formatAppointment(updated.rows[0]);
};
