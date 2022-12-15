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
    const { rows } = await pool.query(
      'SELECT * from affirmations ORDER BY created_at DESC'
    );
    return rows.map((row) => new Affirmation(row));
  }

  static async getById(id) {
    const { rows } = await pool.query(
      `
        SELECT * from affirmations
        WHERE id = $1
        `,
      [id]
    );
    if (!rows[0]) {
      return null;
    }
    return new Affirmation(rows[0]);
  }

  static async insert({ text, category_id }) {
    const { rows } = await pool.query(
      `
      INSERT INTO affirmations (text, category_id)
      VALUES ($1, $2)
      RETURNING *
    `,
      [text, category_id]
    );

    return new Affirmation(rows[0]);
  }

  static async delete(id) {
    const { rows } = await pool.query(
      `
      DELETE FROM affirmations 
      WHERE id = $1 
      RETURNING *
      `,
      [id]
    );
    return new Affirmation(rows[0]);
  }
};
