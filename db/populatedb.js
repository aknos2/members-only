#! /usr/bin/env node

import { Client } from "pg";
import dotenv from 'dotenv';
dotenv.config();


const SQL = `
  DROP TABLE IF EXISTS messages;
  DROP TABLE IF EXISTS users;

  CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    membership_status TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  TRUNCATE TABLE messages, users RESTART IDENTITY CASCADE;

  INSERT INTO users (first_name, last_name, email, password, membership_status)
  VALUES
    ('Amando', 'Macarroni', 'amando@gmail.com', 'Abc123', 'silver'),
    ('Charles', 'Coconut', 'charles@gmail.com', 'Aaa123', null);

  INSERT INTO messages (user_id, content)
  VALUES
    ((SELECT id FROM users WHERE first_name = 'Amando'), 'Hi there!'),
    ((SELECT id FROM users WHERE first_name = 'Charles'), 'Hello world!');
`;



async function main() {
  try {
    console.log("seeding...");
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done");
  } catch (err) {
    console.log('Something went wrong', err);
    process.exit(1);
  }
}

main();