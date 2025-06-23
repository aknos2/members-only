import { Router }from 'express';
import { upgradeMembershipSilverToRouter } from '../controllers/logController.js';

export const membershipRouter = Router();

membershipRouter.get('/membership', (req, res) => {
  res.render('membership', {errors: [], data: {}});
});
membershipRouter.post('/membership', upgradeMembershipSilverToRouter);