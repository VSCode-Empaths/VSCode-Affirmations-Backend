const setup = require('../data/setup.js');
const pool = require('../lib/utils/pool.js');
const request = require('supertest');
const app = require('../lib/app.js');

jest.mock('../lib/services/github');

describe('github auth routes', () => {
  beforeAll(() => {
    if (!String(process.env.REDIRECT_URL ?? '').trim()) {
      process.env.REDIRECT_URL =
        'https://error-affirmations-v2.netlify.app';
    }
  });
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it('/api/v1/github/login should redirect to GitHub with state and set cookie', async () => {
    const res = await request(app).get('/api/v1/github/login');
    const loc = new URL(res.header.location);
    expect(loc.searchParams.get('client_id')).toBe(process.env.GH_CLIENT_ID);
    expect(loc.searchParams.get('state')).toBeTruthy();
    expect(res.header['set-cookie']?.join(';')).toMatch(/gh_oauth_state=/);
  });

  it('/api/v1/github/callback should login users and redirect to dashboards', async () => {
    const agent = request.agent(app);
    const loginRes = await agent.get('/api/v1/github/login');
    const loc = new URL(loginRes.header.location);
    const state = loc.searchParams.get('state');
    const res = await agent
      .get('/api/v1/github/callback')
      .query({ code: '42', state });
    const expectedRedirect =
      process.env.REDIRECT_URL ||
      'https://error-affirmations-v2.netlify.app';
    expect(res.header.location).toMatch(expectedRedirect);
  });
  it('/api/v1/github signs out a user', async () => {
    const agent = request.agent(app);
    const loginRes = await agent.get('/api/v1/github/login');
    const state = new URL(loginRes.header.location).searchParams.get('state');
    await agent.get('/api/v1/github/callback').query({ code: '42', state });
    const deleteUser = await agent.delete('/api/v1/github/dashboard');
    expect(deleteUser.status).toBe(200);
    const check = await agent.get('/api/v1/github/dashboard');
    expect(check.status).toBe(401);
  });
});
