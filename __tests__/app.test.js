const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

// Dummy user for testing
const mockAffirmation = {
  text: 'If all else fails, I can collapse and scream 🦆',
  category_id: '4',
};

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

  it('POST api/v1/affirmations should create a new affirmation', async () => {
    const res = await request(app)
      .post('/api/v1/affirmations')
      .send(mockAffirmation);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      created_at: expect.any(String),
      ...mockAffirmation,
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

  it('GET api/v1/categories/:id should return the category with nested affirmations', async () => {
    const res = await request(app).get('/api/v1/categories/1');
    // expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      type: expect.any(String),
      affirmations: expect.any(Array),
    });
  });

  afterAll(() => {
    pool.end();
  });
});
