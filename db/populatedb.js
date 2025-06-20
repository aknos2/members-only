#! /usr/bin/env node

import { Client } from "pg";
import dotenv from 'dotenv';
dotenv.config();


const SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  INSERT INTO users (first_name, last_name, email, password)
  VALUES
    ('Amando', 'Macarroni', 'amando@gmail.com', 'abc123'),
    ('Charles', 'Coconut', 'charles@gmail.com', 'aaa123');

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

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
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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