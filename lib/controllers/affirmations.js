const { Router } = require('express');
const Affirmation = require('../models/Affirmation');

module.exports = Router().get('/', async (req, res, next) => {
  try {
    const affirmations = await Affirmation.getAll();
    res.json(affirmations);
  } catch (e) {
    next(e);
  }
});
