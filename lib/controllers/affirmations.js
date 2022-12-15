const { Router } = require('express');
const Affirmation = require('../models/Affirmation');

module.exports = Router()
  .get('/:id', async (req, res, next) => {
    try {
      const id = req.params.id;
      const affirmation = await Affirmation.getById(id);
      res.json(affirmation);
    } catch (e) {
      next(e);
    }
  })
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
  })
  .delete('/:id', async (req, res, next) => {
    try {
      const id = req.params.id;
      const affirmation = await Affirmation.delete(id);
      res.json(affirmation);
    } catch (e) {
      next(e);
    }
  });
