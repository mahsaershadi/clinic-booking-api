import { pool } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword } from '../../utils/password.js';

const formatDoctor = (row) => ({
  id: row.id,
  userId: row.user_id,
  fullName: row.full_name,
  email: row.email,
  specialization: row.specialization,
  workStart: row.work_start,
  workEnd: row.work_end,
  createdAt: row.created_at,
});

export const getAllDoctors = async () => {
  const result = await pool.query(
    `SELECT d.id, d.user_id, d.specialization, d.work_start, d.work_end, d.created_at,
            u.full_name, u.email
     FROM doctors d
     INNER JOIN users u ON u.id = d.user_id
     ORDER BY d.created_at ASC`
  );

  return result.rows.map(formatDoctor);
};

export const getDoctorById = async (doctorId) => {
  const result = await pool.query(
    `SELECT d.id, d.user_id, d.specialization, d.work_start, d.work_end, d.created_at,
            u.full_name, u.email
     FROM doctors d
     INNER JOIN users u ON u.id = d.user_id
     WHERE d.id = $1`,
    [doctorId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Doctor not found', 404);
  }

  return formatDoctor(result.rows[0]);
};

export const createDoctor = async (data) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [
      data.email,
    ]);

    if (existing.rows.length > 0) {
      throw new AppError('Email is already registered', 409);
    }

    const passwordHash = await hashPassword(data.password);

    const userResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'DOCTOR')
       RETURNING id, full_name, email`,
      [data.fullName, data.email, passwordHash]
    );

    const user = userResult.rows[0];

    const doctorResult = await client.query(
      `INSERT INTO doctors (user_id, specialization, work_start, work_end)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, specialization, work_start, work_end, created_at`,
      [user.id, data.specialization, data.workStart, data.workEnd]
    );

    await client.query('COMMIT');

    return formatDoctor({
      ...doctorResult.rows[0],
      full_name: user.full_name,
      email: user.email,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
