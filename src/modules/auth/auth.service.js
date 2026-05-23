import { pool } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';

const formatUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at,
});

const buildTokenPayload = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  if (user.role === 'DOCTOR') {
    const doctorResult = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [user.id]
    );

    if (doctorResult.rows[0]) {
      payload.doctorId = doctorResult.rows[0].id;
    }
  }

  return payload;
};

export const registerPatient = async ({ fullName, email, password }) => {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (existing.rows.length > 0) {
    throw new AppError('Email is already registered', 409);
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'PATIENT')
     RETURNING id, full_name, email, role, created_at`,
    [fullName, email, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken(await buildTokenPayload(user));

  return { user: formatUser(user), token };
};

export const login = async ({ email, password }) => {
  const result = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.password_hash, u.role, u.created_at,
            d.id AS doctor_id
     FROM users u
     LEFT JOIN doctors d ON d.user_id = u.id
     WHERE u.email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = result.rows[0];
  const isValid = await comparePassword(password, user.password_hash);

  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  if (user.doctor_id) {
    tokenPayload.doctorId = user.doctor_id;
  }

  const token = signToken(tokenPayload);

  return {
    user: formatUser(user),
    token,
  };
};
