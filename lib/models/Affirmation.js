const pool = require('../utils/pool');

module.exports = class Affirmation {
  id;
  text;
  category_id;
  created_at;

  constructor(row) {
    this.id = row.id;
    this.text = row.text;
    this.category_id = row.category_id;
    this.created_at = row.created_at;
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * from affirmations');
    return rows.map((row) => new Affirmation(row));
  }
};
