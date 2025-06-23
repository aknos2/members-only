import pool from './pool.js';

export async function displayAllMessages() {
  const  { rows } = await pool.query(`
    SELECT
      messages.id,
      messages.content,
      messages.created_at,
      COALESCE(users.first_name, 'Deleted user') AS username
    FROM messages
    LEFT JOIN users ON messages.user_id = users.id
    ORDER BY messages.created_at ASC
    `);
    return rows;
}

export async function sendMessage(user_id, content) {
  await pool.query(
    `INSERT INTO messages (user_id, content) VALUES ($1, $2)`, [user_id, content]
  );
}

export async function deleteMessage(messageId) {
  await pool.query(
    `DELETE FROM messages WHERE id = $1`, [messageId]
  );
}

export async function addUsers(first_name, last_name, email, hashedPassword, membership_status) {
  const { rows } = await pool.query(
    `
    INSERT INTO users (first_name, last_name, email, password, membership_status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `,
    [first_name, last_name, email, hashedPassword, membership_status]
  );

  return rows[0]; 
}

export async function userExists(email) {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  return rows.length > 0;
}

export async function getMembershipStatus() {
  const { rows } = await pool.query("SELECT users.membership_status FROM users");
  return rows;
}

export async function upgradeMembership(userId, grade) {
  const { rows } = await pool.query(`
    UPDATE users
    SET membership_status = $2
    WHERE id = $1 
    RETURNING *;
    `, [userId, grade]);

  return rows;
}