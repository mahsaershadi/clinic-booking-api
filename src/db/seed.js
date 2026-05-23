import { pool } from '../config/database.js';
import { hashPassword } from '../utils/password.js';

const seedData = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const adminPassword = await hashPassword('Admin@123');
    const doctorPassword = await hashPassword('Doctor@123');
    const patientPassword = await hashPassword('Patient@123');

    const adminResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'ADMIN')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      ['System Admin', 'admin@clinic.com', adminPassword]
    );

    const doctorUserResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'DOCTOR')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      ['Dr. Sarah Johnson', 'doctor@clinic.com', doctorPassword]
    );

    await client.query(
      `INSERT INTO doctors (user_id, specialization, work_start, work_end)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE
       SET specialization = EXCLUDED.specialization,
           work_start = EXCLUDED.work_start,
           work_end = EXCLUDED.work_end`,
      [doctorUserResult.rows[0].id, 'General Medicine', '08:00', '14:00']
    );

    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'PATIENT')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name`,
      ['John Patient', 'patient@clinic.com', patientPassword]
    );

    await client.query('COMMIT');

    console.log('Seed completed successfully');
    console.log('Admin:   admin@clinic.com / Admin@123');
    console.log('Doctor:  doctor@clinic.com / Doctor@123');
    console.log('Patient: patient@clinic.com / Patient@123');
    console.log(`Admin user id: ${adminResult.rows[0].id}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seedData();
