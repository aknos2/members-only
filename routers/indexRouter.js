import { Router }from 'express';
import { deleteMessageHandler, displayMessages, getMembershipStatusToRouter, sendMessages } from '../controllers/logController.js';

export const indexRouter = Router();

indexRouter.get('/', displayMessages);
indexRouter.get('/', getMembershipStatusToRouter);
indexRouter.post('/', sendMessages);
indexRouter.post('/:id/delete', deleteMessageHandler);