function adminEmailSet() {
  const parts = [];
  if (process.env.ADMIN_EMAIL) {
    parts.push(process.env.ADMIN_EMAIL);
  }
  if (process.env.ADMIN_EMAILS) {
    parts.push(process.env.ADMIN_EMAILS);
  }
  const raw = parts.join(',');
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

let cachedAdminKey = null;
let cachedAdminEmails = null;

function adminEmailsForRequest() {
  const key = `${process.env.ADMIN_EMAIL ?? ''}\0${process.env.ADMIN_EMAILS ?? ''}`;
  if (key !== cachedAdminKey) {
    cachedAdminKey = key;
    cachedAdminEmails = adminEmailSet();
  }
  return cachedAdminEmails;
}

module.exports = async (req, res, next) => {
  try {
    const emails = adminEmailsForRequest();
    const email = req.user?.email && String(req.user.email).toLowerCase();
    if (!req.user || !email || !emails.has(email)) {
      throw new Error('You do not have access to view this page');
    }

    next();
  } catch (err) {
    err.status = 403;
    next(err);
  }
};
