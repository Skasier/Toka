# Toka Fitness

## Authentication and MongoDB setup

Signup and login are handled by the Express API in `server/index.js`. Member
documents are stored in MongoDB; passwords are hashed before storage, and the
selected `Core` or `Plus` membership is saved with the account. The API uses an
HTTP-only session cookie rather than exposing a database connection string or
session token to the browser.

1. Create a MongoDB Atlas cluster, a database user, and allow your development
   machine's IP address in Atlas Network Access.
2. Copy `.env.example` to `.env`. Set `MONGODB_URI` to your Atlas connection
   string (URL-encode special characters in the database username/password) and
   set `JWT_SECRET` to a long, random value of at least 32 characters.
3. Start the API with `npm run api`.
4. In a second terminal, start the React app with `npm run dev`.

Vite forwards `/api` requests to the local API on port 5000. In production,
deploy the API and frontend behind the same origin, or configure an equivalent
same-site reverse proxy before using the session cookie.

Keep `.env` private. If it is already tracked by Git, remove it from tracking
with `git rm --cached .env` (the local file remains) and rotate any secrets it
contains.
