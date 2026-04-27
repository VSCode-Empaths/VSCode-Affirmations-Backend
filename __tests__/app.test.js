const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const Affirmation = require('../lib/models/Affirmation.js');
const UserService = require('../lib/services/UserService.js');

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

  it('POST api/v1/affirmations should create a new affirmation when authenticated', async () => {
    await UserService.create({
      firstName: 'Post',
      lastName: 'User',
      email: 'post-affirm@example.com',
      password: '12345',
    });
    const agent = request.agent(app);
    await agent.post('/api/v1/users/sessions').send({
      email: 'post-affirm@example.com',
      password: '12345',
    });
    const res = await agent.post('/api/v1/affirmations').send(mockAffirmation);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      created_at: expect.any(String),
      ...mockAffirmation,
    });
  });

  it('POST api/v1/affirmations should return 401 without auth', async () => {
    const res = await request(app)
      .post('/api/v1/affirmations')
      .send(mockAffirmation);
    expect(res.status).toBe(401);
  });

  it('POST api/v1/affirmations should return 400 when text is missing', async () => {
    await UserService.create({
      firstName: 'Val',
      lastName: 'User',
      email: 'val-text@example.com',
      password: '12345',
    });
    const agent = request.agent(app);
    await agent.post('/api/v1/users/sessions').send({
      email: 'val-text@example.com',
      password: '12345',
    });
    const res = await agent
      .post('/api/v1/affirmations')
      .send({ text: '   ', category_id: '1' });
    expect(res.status).toBe(400);
  });

  it('POST api/v1/affirmations should return 400 when category_id is invalid', async () => {
    await UserService.create({
      firstName: 'Val',
      lastName: 'Cat',
      email: 'val-cat@example.com',
      password: '12345',
    });
    const agent = request.agent(app);
    await agent.post('/api/v1/users/sessions').send({
      email: 'val-cat@example.com',
      password: '12345',
    });
    const res = await agent.post('/api/v1/affirmations').send({
      text: 'Valid text',
      category_id: '1.5',
    });
    expect(res.status).toBe(400);
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
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: expect.any(String),
      type: expect.any(String),
      affirmations: expect.any(Array),
    });
  });

  it('GET /api/v1/affirmations/:id should get a single affirmation', async () => {
    await UserService.create({
      firstName: 'GetOne',
      lastName: 'User',
      email: 'getone-affirm@example.com',
      password: '12345',
    });
    const agent = request.agent(app);
    await agent.post('/api/v1/users/sessions').send({
      email: 'getone-affirm@example.com',
      password: '12345',
    });
    const insertAffirmationRes = await agent
      .post('/api/v1/affirmations')
      .send(mockAffirmation);
    expect(insertAffirmationRes.status).toBe(200);
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

  it('GET /api/v1/affirmations/:id should return 404 when missing', async () => {
    const res = await request(app).get(
      '/api/v1/affirmations/999999999'
    );
    expect(res.status).toBe(404);
  });

  it('DELETE /api/v1/affirmations/:id should delete an affirmation', async () => {
    await UserService.create({
      firstName: 'Del',
      lastName: 'User',
      email: 'del-affirm@example.com',
      password: '12345',
    });
    const agent = request.agent(app);
    await agent.post('/api/v1/users/sessions').send({
      email: 'del-affirm@example.com',
      password: '12345',
    });
    const insertAffirmationRes = await Affirmation.insert(mockAffirmation);
    const deleteAffirmationRes = await agent.delete(
      '/api/v1/affirmations/' + insertAffirmationRes.id
    );
    expect(deleteAffirmationRes.status).toBe(200);
    const check = await Affirmation.getById(insertAffirmationRes.id);
    expect(check).toBeNull();
  });

  it('DELETE /api/v1/affirmations/:id should return 401 without auth', async () => {
    const insertAffirmationRes = await Affirmation.insert(mockAffirmation);
    const res = await request(app).delete(
      '/api/v1/affirmations/' + insertAffirmationRes.id
    );
    expect(res.status).toBe(401);
  });

  it('DELETE /api/v1/affirmations/:id should return 404 when missing', async () => {
    await UserService.create({
      firstName: 'Del404',
      lastName: 'User',
      email: 'del404-affirm@example.com',
      password: '12345',
    });
    const agent = request.agent(app);
    await agent.post('/api/v1/users/sessions').send({
      email: 'del404-affirm@example.com',
      password: '12345',
    });
    const res = await agent.delete('/api/v1/affirmations/999999999');
    expect(res.status).toBe(404);
  });

  afterAll(() => {
    pool.end();
  });
});
