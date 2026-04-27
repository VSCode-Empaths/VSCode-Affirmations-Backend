const fetch = require('cross-fetch');

const exchangeCodeForToken = async (code) => {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GH_CLIENT_ID,
      client_secret: process.env.GH_CLIENT_SECRET,
      code,
      // Required when the authorize URL used redirect_uri; must match exactly.
      redirect_uri: process.env.GH_REDIRECT_URI,
    }),
  });
  const data = await res.json();
  if (data.error || !data.access_token) {
    const desc = data.error_description || data.error || 'No access_token from GitHub';
    throw new Error(`GitHub OAuth token: ${desc}`);
  }
  return data.access_token;
};

const getGithubProfile = async (token) => {
  const res = await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  const data = await res.json();
  return data;
};

module.exports = { exchangeCodeForToken, getGithubProfile };
