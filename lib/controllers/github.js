const crypto = require('crypto');
const { Router } = require('express');
const {
  exchangeCodeForToken,
  getGithubProfile,
} = require('../services/github.js');
const GithubUser = require('../models/GithubUser.js');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate.js');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

function redirectUrlOrThrow() {
  const url = process.env.REDIRECT_URL;
  if (typeof url !== 'string' || !url.trim()) {
    const e = new Error('REDIRECT_URL is not configured');
    e.status = 500;
    throw e;
  }
  return url.trim();
}
const GITHUB_OAUTH_STATE_COOKIE = 'gh_oauth_state';
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

function oauthStateMatches(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

module.exports = Router()
  .get('/login', (req, res) => {
    const state = crypto.randomBytes(32).toString('hex');
    const sameSite =
      process.env.SECURE_COOKIES === 'true' ? 'none' : 'lax';
    res
      .cookie(GITHUB_OAUTH_STATE_COOKIE, state, {
        httpOnly: true,
        maxAge: OAUTH_STATE_MAX_AGE_MS,
        secure: process.env.SECURE_COOKIES === 'true',
        sameSite,
      })
      .redirect(
        `https://github.com/login/oauth/authorize?client_id=${process.env.GH_CLIENT_ID}&scope=user&redirect_uri=${process.env.GH_REDIRECT_URI}&state=${encodeURIComponent(
          state
        )}`
      );
  })
  .get('/callback', async (req, res, next) => {
    try {
      const { code, state: queryState } = req.query;
      const sameSite =
        process.env.SECURE_COOKIES === 'true' ? 'none' : 'lax';
      res.clearCookie(GITHUB_OAUTH_STATE_COOKIE, {
        httpOnly: true,
        secure: process.env.SECURE_COOKIES === 'true',
        sameSite,
      });
      const cookieState = req.cookies[GITHUB_OAUTH_STATE_COOKIE];
      if (
        !oauthStateMatches(
          String(queryState ?? ''),
          String(cookieState ?? '')
        )
      ) {
        const e = new Error('Invalid or missing OAuth state');
        e.status = 400;
        throw e;
      }
      const token = await exchangeCodeForToken(code);
      const { email, login, avatar_url } = await getGithubProfile(token);
      const user = await GithubUser.upsertByLogin({
        login,
        email,
        avatar: avatar_url,
      });
      const payload = jwt.sign(
        { sub: String(user.id), typ: 'github' },
        process.env.JWT_SECRET,
        {
          expiresIn: '1 day',
        }
      );
      res
        .cookie(process.env.COOKIE_NAME, payload, {
          httpOnly: true,
          maxAge: ONE_DAY_IN_MS,
          secure: process.env.SECURE_COOKIES === 'true',
          sameSite,
        })
        .redirect(redirectUrlOrThrow());
    } catch (e) {
      next(e);
    }
  })
  .get('/dashboard', [authenticate], (req, res) => {
    res.json(req.user);
  })
  .delete('/dashboard', authenticate, (req, res) => {
    const sameSite =
      process.env.SECURE_COOKIES === 'true' ? 'none' : 'lax';
    res
      .clearCookie(process.env.COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.SECURE_COOKIES === 'true',
        sameSite,
      })
      .json({ success: true, message: 'Signed out! Woot!' });
  });
