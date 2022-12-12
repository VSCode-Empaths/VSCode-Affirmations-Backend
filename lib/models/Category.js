const pool = require('../utils/pool');
const Affirmation = require('./Affirmation.js');

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

  static async getById(id) {
    const { rows } = await pool.query(
      `
        SELECT * from categories
        WHERE id = $1
        `,
      [id]
    );
    return new Category(rows[0]);
  }
  async addAffirmations() {
    const { rows } = await pool.query(
      `
        SELECT * from affirmations
        WHERE category_id = $1
        `,
      [this.id]
    );
    this.affirmations = rows.map((row) => new Affirmation(row));
  }
};
