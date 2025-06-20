import asyncHandler from 'express-async-handler';
import { formatMessageDates } from '../utils/dateFormat.js';
import { displayAllMessages, sendMessage } from '../db/queries.js';
import { body, validationResult } from 'express-validator';

const validateInputs = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 }).withMessage('Message cannot be empty and max 500 characters')
    .matches(/^[a-zA-Z0-9\s.,!?'"()-]+$/).withMessage('Message contains invalid characters'),
];

export const displayMessages = asyncHandler(async(req, res) => {
  const allMessages = formatMessageDates(await displayAllMessages());

  res.render('index', { allMessages });
});

export const sendMessages = [
  validateInputs,
  asyncHandler(async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('index', {
        errors: errors.array(),
        data: req.body
      });
    }

    const { username, content } = req.body;
    await sendMessage( username, content );
    res.redirect('/'); 
  })
];