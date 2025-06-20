import pool from './pool.js';

export async function displayAllMessages() {
  const  { rows } = await pool.query(`
    SELECT
      messages.content,
      messages.created_at,
      COALESCE(users.first_name, 'Deleted user') AS username
    FROM messages
    LEFT JOIN users ON messages.user_id = users.id
    ORDER BY messages.created_at ASC
    `);
    return rows;
}

export async function sendMessage(email, content) {
  const {
    rows: [user],
  } = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);

  if (!user) {
    throw new Error(`User '${email}' not found`);
  }

  await pool.query(
    `INSERT INTO messages (user_id, content) VALUES ($1, $2)`, [user.id, content]
  );
}