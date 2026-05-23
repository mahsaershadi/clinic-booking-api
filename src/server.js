import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';

const startServer = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL connected');

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
