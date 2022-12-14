const setup = require('../data/setup.js');
const pool = require('../lib/utils/pool.js');
const request = require('supertest');
const app = require('../lib/app.js');

jest.mock('../lib/services/github');

describe('github auth routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it('/api/v1/github/login should redirect to the github oauth page', async () => {
    const res = await request(app).get('/api/v1/github/login');
    expect(res.header.location).toMatch(
      /https:\/\/github.com\/login\/oauth\/authorize\?client_id=[.\w\d]+&scope=user&redirect_uri=https:\/\/error-affirmations.herokuapp.com\/api\/v1\/github\/callback/i
    );
  });

  it('/api/v1/github/callback should login users and redirect to dashboard', async () => {
    const res = await request
      .agent(app)
      .get('/api/v1/github/callback?code=42')
      .redirects(1);
    expect(res.body).toEqual({
      id: expect.any(String),
      login: 'lottie_dog',
      email: 'lottie@lottie.com',
      avatar: 'https://www.placecage.com/gif/300/300',
      iat: expect.any(Number),
      exp: expect.any(Number),
    });
  });
  it('/api/v1/github signs out a user', async () => {
    const agent = request.agent(app);
    await agent.get('/api/v1/github/callback?code=42');
    const deleteUser = await agent.delete('/api/v1/github/dashboard');
    expect(deleteUser.status).toBe(200);
    const check = await agent.get('/api/v1/github/dashboard');
    expect(check.status).toBe(401);
  });
});
