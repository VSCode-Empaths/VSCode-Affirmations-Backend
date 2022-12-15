const exchangeCodeForToken = async () => {
  return 'MOCK TOKEN FOR CODE';
};

const getGithubProfile = async () => {
  return {
    login: 'lottie_dog',
    avatar_url: 'https://www.placecage.com/gif/300/300',
    email: 'lottie@lottie.com',
  };
};

module.exports = { exchangeCodeForToken, getGithubProfile };
