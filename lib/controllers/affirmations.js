const { Router } = require('express');
const Affirmation = require('../models/Affirmation');
const authenticate = require('../middleware/authenticate');

module.exports = Router()
  .get('/:id', async (req, res, next) => {
    try {
      const id = req.params.id;
      const affirmation = await Affirmation.getById(id);
      if (!affirmation) {
        const err = new Error('Affirmation not found');
        err.status = 404;
        throw err;
      }
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
  .post('/', authenticate, async (req, res, next) => {
    try {
      const text =
        typeof req.body.text === 'string' ? req.body.text.trim() : '';
      if (!text) {
        const e = new Error('text is required');
        e.status = 400;
        throw e;
      }
      const rawCategory = req.body.category_id;
      const category_id =
        rawCategory === undefined || rawCategory === null || rawCategory === ''
          ? NaN
          : Number(rawCategory);
      if (
        !Number.isFinite(category_id) ||
        !Number.isInteger(category_id) ||
        category_id < 1
      ) {
        const e = new Error('category_id must be a positive integer');
        e.status = 400;
        throw e;
      }
      const affirmation = await Affirmation.insert({
        text,
        category_id,
      });
      res.json(affirmation);
    } catch (e) {
      next(e);
    }
  })
  .delete('/:id', authenticate, async (req, res, next) => {
    try {
      const id = req.params.id;
      const affirmation = await Affirmation.delete(id);
      if (!affirmation) {
        const err = new Error('Affirmation not found');
        err.status = 404;
        throw err;
      }
      res.json(affirmation);
    } catch (e) {
      next(e);
    }
  });
