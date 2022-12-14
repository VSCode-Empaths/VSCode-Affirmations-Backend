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
};
