import asyncHandler from 'express-async-handler';
import { formatMessageDates } from '../utils/dateFormat.js';
import { addUsers, deleteMessage, displayAllMessages, getMembershipStatus, sendMessage, upgradeMembership, userExists } from '../db/queries.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config();

const validateUserRegistration = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isAlpha().withMessage('First name must contain only letters')
    .isLength({ max: 50 }).withMessage('First name must be 50 characters or fewer'),

  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isAlpha().withMessage('Last name must contain only letters')
    .isLength({ max: 50 }).withMessage('Last name must be 50 characters or fewer'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const exists = await userExists(email);
      if (exists) {
        throw new Error('Email already in use');
      }
      return true;
    }),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 30 }).withMessage('Password must be between 6 and 30 characters')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
];

const validateMessage = [
   body('message')
    .trim()
    .isLength({ min: 1, max: 500 }).withMessage('Message cannot be empty and max 500 characters')
    .matches(/^[a-zA-Z0-9\s.,!?'"()-]+$/).withMessage('Message contains invalid characters')
];


export const displayMessages = asyncHandler(async(req, res) => {
  const allMessages = formatMessageDates(await displayAllMessages());

  res.render('index', { allMessages, user: req.user });
});

export const sendMessages = [
  validateMessage,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const allMessages = formatMessageDates(await displayAllMessages());

      return res.status(400).render('index', {
        errors: errors.array(),
        data: req.body,
        allMessages,
        user: req.user,
      });
    }

    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).send('User must be logged in to post a message.');
    }

    await sendMessage(userId, message);
    res.redirect('/');
  })
];

export const deleteMessageHandler = asyncHandler(async(req, res) => {
  try {
    if (!req.user || req.user.membership_status !== 'admin') {
      return res.status(403).send('Forbidden: Only admins can delete messages.');
    }
    
    const messageId = parseInt(req.params.id, 10);

    await(deleteMessage(messageId));
    res.redirect('/');
  } catch {
    next(err);
  }
});


export const addUserToRouter = [
  validateUserRegistration,
  asyncHandler(async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('sign-up', {
        errors: errors.array(),
        data: req.body
      });
    }

    const { first_name, last_name, email, password, membership_status } = req.body;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await addUsers(first_name, last_name, email, hashedPassword, membership_status);
      req.session.successMessage = 'Sign-up successful! You can now log in.';
      res.redirect('/login');
    } catch (error) {
      console.log('Database error:', error); 
      
      // Handle duplicate email error (PostgreSQL error code for unique violation)
      if (error.code === '23505') {
        return res.status(400).render('sign-up', {
          errors: [{ msg: 'Email already in use' }],
          data: req.body
        });
      }
      
      // Re-throw other errors
      throw error;
    }
  })
];

export const getMembershipStatusToRouter = asyncHandler(async(req, res) => {
  const status = getMembershipStatus();
  res.render('index', { status });
});

export const upgradeMembershipSilverToRouter = asyncHandler(async (req, res) => {
  const answer = req.body.answer?.trim().toLowerCase();

  if (!req.user) {
    return res.status(401).send('You must be logged in.');
  }

  if (answer === process.env.MEMBERSHIP_ANSWER) {
    const updatedUser = await upgradeMembership(req.user.id, 'silver');

    if (updatedUser) {
      return res.redirect('/');
    } else {
      return res.status(400).render('membership', {
        errors: [{ msg: 'Something went wrong while updating membership.' }]
      });
    }
  } else {
    return res.status(400).render('membership', {
      errors: [{ msg: 'Incorrect answer. Try again!' }]
    });
  }
});

export const loginHandler = asyncHandler(async (req, res, next) => {
  const adminPassword = req.body['admin-password'];

  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).render('login', {
        errors: [{ msg: info.message }],
        data: req.body,
      });
    }

    if (adminPassword && adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(400).render('login', {
        errors: [{ msg: 'Incorrect admin password' }],
        data: req.body,
      });
    }

    req.logIn(user, async (err) => {
      if (err) return next(err);

      if (adminPassword === process.env.ADMIN_PASSWORD) {
        await upgradeMembership(user.id, 'admin');
      }

      return res.redirect('/');
    });
  })(req, res, next);
});