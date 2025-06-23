import { Router }from 'express';
import { addUserToRouter } from '../controllers/logController.js';

export const signupRouter = Router();

signupRouter.get('/sign-up', (req, res) => {
  res.render('sign-up', {errors: [], data: {}});
});
signupRouter.post('/sign-up', addUserToRouter);