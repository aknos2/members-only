import express from 'express';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import { fileURLToPath } from 'url';
import { indexRouter } from './routers/indexRouter.js';
import { signupRouter } from './routers/signupRouter.js';
import { loginRouter } from './routers/loginRoute.js';
import './config/passport.js';
import { membershipRouter } from './routers/membershipRouter.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Makes user available in all templates
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
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, (req, res) => {
  console.log(`Listening on port ${PORT}`);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).send(err.message);
});