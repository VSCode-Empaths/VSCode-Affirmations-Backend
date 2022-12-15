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
      `https://github.com/login/oauth/authorize?client_id=${process.env.GH_CLIENT_ID}&scope=user&redirect_uri=${process.env.GH_REDIRECT_URI}`
    );
  });

  it('/api/v1/github/callback should login users and redirect to dashboards', async () => {
    const res = await request.agent(app).get('/api/v1/github/callback?code=42');
    expect(res.header.location).toMatch(
      'https://error-affirmations.netlify.app'
    );
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
