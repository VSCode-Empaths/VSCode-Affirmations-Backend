const { Router } = require('express');
const Affirmation = require('../models/Affirmation');

module.exports = Router()
  .get('/', async (req, res, next) => {
    try {
      const affirmations = await Affirmation.getAll();
      res.json(affirmations);
    } catch (e) {
      next(e);
    }
  })
  .post('/', async (req, res, next) => {
    try {
      const affirmation = await Affirmation.insert({
        text: req.body.text,
        category_id: req.body.category_id,
      });
      res.json(affirmation);
    } catch (e) {
      next(e);
    }
  });
