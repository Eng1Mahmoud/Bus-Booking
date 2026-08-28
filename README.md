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
| **API**      | Node 20 · Express 4 · TypeScript · MongoDB (Mongoose) · zod                       |
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

Then create the two environment files. **Neither belongs in git.**

`back/.env`:

```ini
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
BCRYPT_ROUNDS=12
VERIFICATION_CODE_TTL_MINUTES=10

MAIL_SENDER=
MAIL_PASSWORD=

PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_CURRENCY=USD
EGP_TO_USD_RATE=48
```

`front/.env.local`:

```ini
# Leave empty in development — Vite proxies /api to the API on :5000.
VITE_API_URL=
VITE_PAYPAL_CLIENT_ID=
```

Everything in the frontend file ships inside the JavaScript bundle and is
public. The PayPal client **secret** belongs only in `back/.env`.

### The three the API will not start without

It validates its whole environment at boot and exits with a list of what is
missing, rather than failing later on the first request that needs it.

| Variable             | Where it comes from                     |
| -------------------- | --------------------------------------- |
| `MONGO_URI`          | Atlas → Connect → Drivers               |
| `JWT_ACCESS_SECRET`  | generate, below                         |
| `JWT_REFRESH_SECRET` | generate, below — **a different value** |

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Run it twice. Reusing one secret for both means a stolen access token can be
replayed as a refresh token.

The rest are optional and degrade cleanly: without the mail pair, verification
emails are logged instead of sent; without the PayPal pair, the payment
endpoints return a clear 503.

```bash
npm run dev:back    # http://localhost:5000
npm run dev:front   # http://localhost:3000
```

Check it came up: `curl http://localhost:5000/api/health`

An empty database has nothing to search for — add trips through the admin
endpoints (`POST /api/admin/trips`) once an admin account exists.

---

## Two things that will waste an afternoon

**The connection string.** If your Atlas password contains any of
`@ : / ? # [ ] %` it **must** be percent-encoded in `MONGO_URI` — `@` becomes
`%40`. The driver splits the URI at the first `@`, so an unescaped one turns the
rest of your password into the hostname and you get `querySrv ENOTFOUND`.
Generating the password from Atlas's own "Autogenerate Secure Password" avoids
it entirely.

**Antivirus and TLS.** Some consumer antivirus products (AVG and Avast among
them) intercept outbound TLS, including SMTP. Node then cannot verify the
substituted certificate and mail fails with
`unable to verify the first certificate` — while the API still answers
"code sent", because it deliberately does not reveal whether delivery worked.

If verification emails never arrive, check the API log for
`Failed to send verification email`, then run Node with the system trust store:

```bash
node --use-system-ca dist/server.js
```

Or set it once for every Node process:

```powershell
[Environment]::SetEnvironmentVariable('NODE_OPTIONS','--use-system-ca','User')
```

Also check `NODE_EXTRA_CA_CERTS`. If it points at a file that does not exist,
Node warns on every start and certificate verification fails regardless.

---

## Deploying

**API (Render).** Build `npm install && npm run build`, start `npm start`. Set
every variable listed above, and `ALLOWED_ORIGINS` to the web app's real
origin — the CORS allowlist is not a wildcard.

**Web (Vercel).** Build `npm run build`, output `build`. Set `VITE_API_URL` to
the API's origin (no trailing slash, no `/api`) and `VITE_PAYPAL_CLIENT_ID` to
the public PayPal client id. Both are read at build time, so a change needs a
redeploy.

### Admin passwords

Admin passwords were previously stored in plaintext. They are bcrypt-hashed
now, and any row still holding a plaintext value is upgraded automatically the
first time that admin signs in — so nothing is required of you, but the upgrade
only happens on login.

---

## Contributing

Conventional commits, enforced by commitlint. Prettier runs on staged files
through a pre-commit hook.

```
feat: · fix: · docs: · style: · refactor: · perf: · test: · build: · ci: · chore: · security:
```

## Author

**Mahmoud Mohamed** — [@Eng1Mahmoud](https://github.com/Eng1Mahmoud)
