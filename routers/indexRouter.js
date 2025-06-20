import { Router }from 'express';
import { displayMessages, sendMessages } from '../controllers/logController.js';

export const indexRouter = Router();

indexRouter.get('/', displayMessages);
indexRouter.post('/', sendMessages);