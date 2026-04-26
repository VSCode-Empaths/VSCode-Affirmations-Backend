# Template for Backend Express

The Golden Rule:
🦸 🦸‍♂️ Stop starting and start finishing. 🏁

If you work on more than one feature at a time, you are guaranteed to multiply your bugs and your anxiety.

## Scripts

| command                | description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `npm start`            | starts the app - should only be used in production as changes will not get reloaded |
| `npm run start:watch`  | runs the app using `nodemon` which watches for changes and reloads the app          |
| `npm test`             | runs the tests once                                                                 |
| `npm run test:watch`   | continually watches and runs the tests when files are updated                       |
| `npm run setup-db`     | runs `sql/setup.sql` (use a local DB in dev, or set `DATABASE_URL` for Supabase)     |

## Deploy: Fly.io + Supabase (Postgres)

1. In [Supabase](https://supabase.com), create a project. Copy **Settings → Database →** connection string (URI) for Node/pg.
2. In Supabase **SQL Editor**, run `sql/setup.sql` once (or from this repo, `npm run setup-db` with that `DATABASE_URL` in `.env`).
3. Install the [Supabase](https://supabase.com/docs/guides/cli) and [Fly](https://fly.io/docs/flyctl/install/) CLIs, then `fly auth login`.
4. Set `app` in `fly.toml` to a unique name (or run `fly launch` and merge the generated `fly.toml` if you prefer).
5. Set secrets (replace with your values):

   `fly secrets set DATABASE_URL="postgresql://..." PGSSLMODE=require JWT_SECRET=... COOKIE_NAME=... SALT_ROUNDS=10 SECURE_COOKIES=true GH_CLIENT_ID=... GH_CLIENT_SECRET=... GH_REDIRECT_URI=... REDIRECT_URL=... API_URL="https://<your-app>.fly.dev"`

6. `fly deploy`
7. Add your Fly app URL to `origin` in `lib/app.js` (CORS) and update the GitHub OAuth app redirect/callback + Netlify env if the public URL changed.
8. When traffic looks good, delete the Heroku app and database add-on to stop billing.
