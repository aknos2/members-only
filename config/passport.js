import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import pool from "../db/pool.js";
import passport from "passport";

passport.use(
  new LocalStrategy(
    { usernameField: 'email'},
    async (email, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect email or user does not exist"});
      }
      
      // Using bcrypt here
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user)
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => { done(null, user.id)});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];

    done(null, user);
  } catch(err) {
    done(err);
  }
});