import { Router }from 'express';

export const signupRouter = Router();

signupRouter.get('/sign-up', (req, res) => {
  res.render('sign-up');
});