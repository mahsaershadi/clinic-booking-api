import { pool } from '../../config/database.js';

const formatUser = (row) => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at,
});

export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, full_name, email, role, created_at
     FROM users
     ORDER BY created_at ASC`
  );

  return result.rows.map(formatUser);
};
