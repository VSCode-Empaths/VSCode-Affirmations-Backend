const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

describe('affirmations and category routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('GET api/v1/affirmations should return a list of affirmations', async () => {
    const res = await request(app).get('/api/v1/affirmations');
    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({
      id: expect.any(String),
      text: expect.any(String),
      category_id: expect.any(String),
      created_at: expect.any(String),
    });
  });
  it('GET api/v1/categories should return a list of categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body[0]).toEqual({
      id: expect.any(String),
      type: expect.any(String),
    });
  });

  afterAll(() => {
    pool.end();
  });
});
