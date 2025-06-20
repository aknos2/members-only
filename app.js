import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { indexRouter } from './routers/indexRouter.js';
import { signupRouter } from './routers/signupRouter.js';
import { loginRouter } from './routers/loginRoute.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

// Routes
app.use('/', indexRouter);
app.use('/', signupRouter);
app.use('/', loginRouter);

const PORT = process.env.PORT || 3030;
app.listen(PORT, (req, res) => {
  console.log(`Listening on port ${PORT}`);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).send(err.message);
});