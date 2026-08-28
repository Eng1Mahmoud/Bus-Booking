# Tazkarty — Bus Booking

Book bus tickets across Egypt: search routes, pick a seat, pay online.

A graduation project, refactored from the ground up. The plan, the reasoning
behind each decision, and the twenty security findings that drove it are in
[REFACTOR_PLAN.md](REFACTOR_PLAN.md); the API surface is in
[docs/api.md](docs/api.md).

---

## Stack

|              |                                                                                   |
| ------------ | --------------------------------------------------------------------------------- |
| **API**      | Node 20 · Express 4 · TypeScript · MongoDB (Mongoose) · zod · Vitest              |
| **Web**      | React 19 · TypeScript · Vite 8 · MUI 9 · TanStack Query · react-hook-form + zod   |
| **Auth**     | Short-lived access token in memory · rotating refresh token in an httpOnly cookie |
| **Payments** | PayPal Orders v2, created and captured **server-side**                            |

Structure mirrors the sibling portfolio project: `routes → controllers →
services → models` on the API, and `api/ → services/ → hooks/ → components/`
on the web side.

---

## Running it

Requires Node 20.11 or newer and a MongoDB database (Atlas or local).

```bash
npm run install:all
```

Then create the two env files. **Neither belongs in git.**

```bash
cp back/.env.example back/.env
cp front/.env.example front/.env.local
```

`back/.env` needs three values before the API will start — it validates its
whole environment at boot and exits with a list of what is missing rather than
failing later on the first request that needs it:

| Variable             | Where it comes from                                           |
| -------------------- | ------------------------------------------------------------- |
| `MONGO_URI`          | Atlas → Connect → Drivers. Must keep the `MONGO_URI=` prefix. |
| `JWT_ACCESS_SECRET`  | generate, below                                               |
| `JWT_REFRESH_SECRET` | generate, below — **a different value**                       |

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Run it twice. Reusing one secret for both means a stolen access token can be
replayed as a refresh token.

Everything else is optional and degrades cleanly: without `MAIL_SENDER` /
`MAIL_PASSWORD` verification emails are logged instead of sent, and without
`PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` the payment endpoints return a
clear 503.

```bash
npm run dev:back    # http://localhost:5000
npm run dev:front   # http://localhost:3000
```

The dev server proxies `/api` to the API, so the two are same-origin in
development and CORS never applies. `front/.env.local` can leave
`VITE_API_URL` empty because of that.

Check it came up: `curl http://localhost:5000/api/health`

---

## Tests

```bash
npm --prefix back test     # API, against an in-memory MongoDB
npm --prefix front test    # components and schemas
```

The API suite is mostly regression tests for the security findings — that a
password reset cannot be forged, that a user token cannot reach an admin route,
that a booking without a captured payment is refused, and that two simultaneous
requests for one seat produce one success and one 409.

---

## Deploying

**API (Render).** Build `npm install && npm run build`, start `npm start`. Set
every variable from `back/.env.example`, and `ALLOWED_ORIGINS` to the web app's
real origin — the CORS allowlist is not a wildcard.

Run once, after the first deploy:

```bash
npm run migrate:admins
```

Admin passwords were stored in plaintext. This hashes them. Nobody is locked
out if it is skipped — login upgrades a row on the way through — but it should
not be skipped.

**Web (Vercel).** Build `npm run build`, output `build`. Set `VITE_API_URL` to
the API's origin (no trailing slash, no `/api`) and `VITE_PAYPAL_CLIENT_ID` to
the public PayPal client id. Both are read at build time, so a change needs a
redeploy.

---

## Contributing

Conventional commits, enforced by commitlint. Prettier runs on staged files
through a pre-commit hook. CI runs typecheck, tests and build for both
workspaces on every pull request.

```
feat: · fix: · docs: · style: · refactor: · perf: · test: · build: · ci: · chore: · security:
```

## Author

**Mahmoud Mohamed** — [@Eng1Mahmoud](https://github.com/Eng1Mahmoud)
