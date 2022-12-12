const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('GET api/v1/affirmations should return a list of affirmations', async () => {
    const res = await request(app).get('/affirmations');
    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({
      id: expect.any(String),
      text: expect.any(String),
      category_id: expect.any(String),
      created_at: expect.any(String),
    });
  });
  afterAll(() => {
    pool.end();
  });
});
