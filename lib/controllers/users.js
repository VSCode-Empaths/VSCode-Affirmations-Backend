const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const User = require('../models/User');
const UserService = require('../services/UserService');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

module.exports = Router()
  .post('/', async (req, res, next) => {
    try {
      const user = await UserService.create(req.body); // calling UserService instead of model
      res.json(user);
    } catch (e) {
      next(e);
    }
  })

  .post('/sessions', async (req, res, next) => {
    try {
      const token = await UserService.signIn(req.body); // go check if they can have a wristband
      res
        .cookie(process.env.COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.SECURE_COOKIES === 'true',
          sameSite: process.env.SECURE_COOKIES === 'true' ? 'none' : 'strict',
          maxAge: ONE_DAY_IN_MS,
        })
        .json({ message: 'Signed in successfully!' }); // attach wristband to wrist
    } catch (e) {
      next(e);
    }
  })

  .get('/me', authenticate, async (req, res) => {
    res.json(req.user);
  })

  .get('/protected', authenticate, async (req, res) => {
    res.json({ message: 'hello world' });
    res.status(200);
  })

  .get('/', [authenticate, authorize], async (req, res, next) => {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (e) {
      next(e);
    }
  })
  .delete('/sessions', (req, res) => {
    res
      .clearCookie(process.env.COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.SECURE_COOKIES === 'true',
        sameSite: process.env.SECURE_COOKIES === 'true' ? 'none' : 'strict',
        maxAge: ONE_DAY_IN_MS,
      })
      .status(204)
      .send();
  });
