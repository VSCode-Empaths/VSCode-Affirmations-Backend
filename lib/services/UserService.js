const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = class UserService {
  static async create({ firstName, lastName, email, password }) {
    if (typeof email !== 'string' || !email.trim()) {
      const e = new Error('Email is required');
      e.status = 400;
      throw e;
    }
    if (typeof password !== 'string' || password.length === 0) {
      const e = new Error('Password is required');
      e.status = 400;
      throw e;
    }
    const trimmedEmail = email.trim();
    const localPart = trimmedEmail.split('@')[0] || 'user';
    const resolvedFirst =
      typeof firstName === 'string' && firstName.trim()
        ? firstName.trim()
        : localPart;
    const resolvedLast =
      typeof lastName === 'string' && lastName.trim() ? lastName.trim() : '';

    const saltRounds = Number(process.env.SALT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.insert({
      firstName: resolvedFirst,
      lastName: resolvedLast,
      email: trimmedEmail,
      passwordHash,
    });

    return user;
  }

  static async signIn({ email, password = '' }) {
    const user = await User.getByEmail(email);
    if (!user) {
      const e = new Error('Invalid credentials');
      e.status = 401;
      throw e;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      const e = new Error('Invalid credentials');
      e.status = 401;
      throw e;
    }
    return jwt.sign(
      { sub: String(user.id), typ: 'user' },
      process.env.JWT_SECRET,
      {
        expiresIn: '1 day',
      }
    );
  }
};
