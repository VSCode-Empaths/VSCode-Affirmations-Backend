const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');

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

  it('GET /api/v1/affirmations/:id should get a single affirmation', async () => {
    const insertAffirmationRes = await request(app)
      .post('/api/v1/affirmations')
      .send(mockAffirmation);
    const res = await request(app).get(
      `/api/v1/affirmations/${insertAffirmationRes.body.id}`
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      created_at: expect.any(String),
      ...mockAffirmation,
    });
  });

  /* it('DELETE /api/v1/affirmations/:id should delete an affirmation', async () => {
    const affirmation = await affirmation.insert(mockAffirmation);
    const resp = await app.delete(`/api/v1/affirmations/${affirmation.id}`);
    expect(resp.status).toBe(200);

    const check = await affirmation.getById(affirmation.id);
    expect(check).toBeNull();
  }); */

  afterAll(() => {
    pool.end();
  });
});
