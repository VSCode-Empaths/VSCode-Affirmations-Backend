const pool = require('../utils/pool');

module.exports = class Category {
  id;
  type;

  constructor(row) {
    this.id = row.id;
    this.type = row.type;
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * from categories');
    return rows.map((row) => new Category(row));
  }
};
