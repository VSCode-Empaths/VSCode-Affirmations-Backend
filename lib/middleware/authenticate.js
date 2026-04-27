const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GithubUser = require('../models/GithubUser');

async function sessionUserFromPayload(payload) {
  if (payload.typ === 'user' && payload.sub != null) {
    const row = await User.getById(payload.sub);
    if (!row) throw new Error('Invalid session');
    return {
      id: row.id,
      typ: 'user',
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
    };
  }
  if (payload.typ === 'github' && payload.sub != null) {
    const row = await GithubUser.getById(payload.sub);
    if (!row) throw new Error('Invalid session');
    return {
      id: row.id,
      typ: 'github',
      email: row.email,
      login: row.login,
      avatar: row.avatar,
    };
  }
  throw new Error('Invalid session');
}

function isAuthFailure(err) {
  return (
    err.message === 'You must be signed in to continue' ||
    err.message === 'Invalid session' ||
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError' ||
    err.name === 'NotBeforeError'
  );
}

module.exports = async (req, res, next) => {
  try {
    const cookie = req.cookies[process.env.COOKIE_NAME];
    // Check the httpOnly session cookie for the current user
    if (!cookie) throw new Error('You must be signed in to continue');

    const payload = jwt.verify(cookie, process.env.JWT_SECRET);
    req.user = await sessionUserFromPayload(payload);
    next();
  } catch (err) {
    if (isAuthFailure(err)) {
      err.status = 401;
    }
    next(err);
  }
};
