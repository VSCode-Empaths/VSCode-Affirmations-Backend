const { Router } = require('express');
const Category = require('../models/Category');

module.exports = Router()
  .get('/:id', async (req, res, next) => {
    try {
      const category = await Category.getById(req.params.id);
      await category.addAffirmations();
      res.json(category);
    } catch (e) {
      next(e);
    }
  })

  .get('/', async (req, res, next) => {
    try {
      const categories = await Category.getAll();
      res.json(categories);
    } catch (e) {
      next(e);
    }
  });
