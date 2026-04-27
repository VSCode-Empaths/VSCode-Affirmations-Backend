const pool = require('../utils/pool');

module.exports = class Affirmation {
  id;
  text;
  category_id;
  created_at;
  user_id;
  github_user_id;

  constructor(row) {
    this.id = row.id;
    this.text = row.text;
    this.category_id = row.category_id;
    this.created_at = row.created_at;
    this.user_id = row.user_id ?? null;
    this.github_user_id = row.github_user_id ?? null;
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

  static async insert({ text, category_id, user_id = null, github_user_id = null }) {
    const { rows } = await pool.query(
      `
      INSERT INTO affirmations (text, category_id, user_id, github_user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [text, category_id, user_id, github_user_id]
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
    if (!rows[0]) {
      return null;
    }
    return new Affirmation(rows[0]);
  }
};
