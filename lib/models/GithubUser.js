const pool = require('../utils/pool.js');

module.exports = class GithubUser {
  id;
  email;
  login;
  avatar;

  constructor(row) {
    this.id = row.id;
    this.email = row.email;
    this.login = row.login;
    this.avatar = row.avatar;
  }

  static async getById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM github_users WHERE id=$1',
      [id]
    );
    if (!rows[0]) return null;
    return new GithubUser(rows[0]);
  }

  static async updateByLogin(login, { email, avatar }) {
    const { rows } = await pool.query(
      `UPDATE github_users
       SET email = COALESCE($2, email), avatar = COALESCE($3, avatar)
       WHERE login = $1
       RETURNING *`,
      [login, email ?? null, avatar ?? null]
    );
    if (!rows[0]) return null;
    return new GithubUser(rows[0]);
  }

  static async findByLogin(login) {
    const { rows } = await pool.query(
      `SELECT *
        FROM github_users
        WHERE login=$1`,
      [login]
    );
    if (!rows[0]) return null;
    return new GithubUser(rows[0]);
  }

  static async insert({ login, email, avatar }) {
    if (!login) throw new Error('login is required!');
    const { rows } = await pool.query(
      `INSERT INTO github_users (login, email, avatar)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [login, email, avatar]
    );
    return new GithubUser(rows[0]);
  }

  static async upsertByLogin({ login, email, avatar }) {
    if (!login) throw new Error('login is required!');
    const { rows } = await pool.query(
      `INSERT INTO github_users (login, email, avatar)
       VALUES ($1, $2, $3)
       ON CONFLICT (login) DO UPDATE SET
         email = COALESCE(EXCLUDED.email, github_users.email),
         avatar = COALESCE(EXCLUDED.avatar, github_users.avatar)
       RETURNING *`,
      [login, email, avatar]
    );
    return new GithubUser(rows[0]);
  }
};
