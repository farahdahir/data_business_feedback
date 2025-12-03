const bcrypt = require('bcryptjs');
const pool = require('../database/db');
require('dotenv').config();

async function resetPassword() {
  const email = 'admin@kra.go.ke';
  const password = 'Admin123!';

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [passwordHash, email]
    );

    console.log(`Password for ${email} has been reset to ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetPassword();
