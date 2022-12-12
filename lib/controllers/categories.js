const { Router } = require('express');
const Category = require('../models/Category');

module.exports = Router().get('/', async (req, res, next) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (e) {
    next(e);
  }
});
