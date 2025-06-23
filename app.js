import express from 'express';
import path from 'path';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import passport from 'passport';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import pool from './db/pool.js'; 
import { indexRouter } from './routers/indexRouter.js';
import { signupRouter } from './routers/signupRouter.js';
import { loginRouter } from './routers/loginRoute.js';
import { membershipRouter } from './routers/membershipRouter.js';
import './config/passport.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

// ✅ Use proper PostgreSQL-backed session store
app.use(session({
  store: new (pgSession(session))({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.use(passport.initialize());
app.use(passport.session());

// Make user available in all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/', signupRouter);
app.use('/', loginRouter);
app.use('/', membershipRouter);
app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// Global error handler
app.use((err, req, res, next) => {
  console.log(err);

  if (res.headersSent) {
    return next(err); // delegate to default Express error handler
  }

  res.status(err.statusCode || 500).send(err.message);
});