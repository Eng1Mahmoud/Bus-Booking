# Bus Booking (Tazkarty) — Refactor Plan

Bringing this project up to the same architecture, conventions and security posture as
`portfolio-backend` / `portfolio_frontend`, while keeping React on the frontend.

**Decisions locked in**

| Area               | Decision                                                             |
| ------------------ | -------------------------------------------------------------------- |
| Frontend framework | Stay React (SPA). Migrate CRA → **Vite**, React 18 → **React 19.2**  |
| Styling            | Keep **MUI**, remove `styled-components` (Emotion only)              |
| Language           | **TypeScript on both sides**                                         |
| Auth               | Short-lived access token **in memory** + **httpOnly refresh cookie** |
| Payments           | **Server-side PayPal order creation + capture**, price from DB       |

---

## 1. Where the project stands

```
back/                          front/src/
  index.mjs                      components/   (28 files, ~4200 LOC)
  controlar/  (7 files)          pages/        (12 files)
  models/     (3 files)          redux/        (1 slice)
  routes/     (5 files)          langs/
```

vs. the portfolio, which already has the target shape:

```
portfolio-backend/src/          portfolio_frontend/
  app.ts                          actions/    <- data layer
  config/                         fetch/      <- single typed HTTP client
  routes/ -> controllers/         zod/        <- validation schemas
        -> services/ -> models/   types/      <- API response types
  middlewares/                    hooks/
  types/                          components/forms/  <- Form + InputField primitives
```

The gap is not cosmetic. The backend has **no service layer, no validation layer, no role
model, and no error handling**; the frontend has **no data layer** — twelve components each
build their own `axios` call against a hardcoded URL.

---

## 2. Security findings

Ordered by severity.

> **Status.** S1, S2, S4, S5, S6, S7 are **fixed in Phase 2**, with regression
> tests in `back/src/__tests__/auth.security.test.ts`. S8–S10 and S13–S14, S17–S19
> were fixed in Phase 1. S3 and S11 are **fixed in Phase 3**. S15–S16 are the
> frontend half and are Phase 6. Findings below are kept as written so the
> before/after is legible.

### Critical

✅ FIXED (Phase 2) **S1 — Any account can be taken over by anyone.**
`back/controlar/user.mjs` — `sendCodeVerification` returns the reset code **in the HTTP
response body**, and `newPassword` then compares two values that both come from `req.body`:

```js
const { email, password, verificationCode, verification_code } = req.body;
if (verificationCode === verification_code) {
  /* reset the password */
}
```

An attacker never needs the email. `POST /newPassword` with
`{email: "victim@x.com", password: "hunter2", verificationCode: "1", verification_code: "1"}`
resets any account. **This is the single most urgent fix in the repo.**

✅ FIXED (Phase 2) **S2 — Email verification at signup is decorative.**
`SignUp` returns `verification_code` _and the entire submitted user object_ to the client
(`front/src/components/SignUp.jsx:79-80` stashes both in `sessionStorage`). `verification`
then trusts the client's code and saves `req.body.user` — so the attacker controls every
field of the user document, and can register any email address without owning it.

✅ FIXED (Phase 3) **S3 — Payment can be skipped entirely.**
`front/src/components/Trips/Book.jsx:29` posts the booking from the browser _after_
client-side PayPal approval, and includes `seatePrice` from the client.
`back/controlar/book.mjs` never contacts PayPal. Calling `/book` directly with a valid login
token and any price yields a free ticket.

✅ FIXED (Phase 2) **S4 — No role separation; every user is an admin.**
`back/controlar/jwt.mjs` only verifies the signature. All `/admin/*` routes use that same
`verifyToken`. Any registered user's token authorizes `addAdmin`, `deleteAdmin`, `AddTrip`,
`deleteTrip`, `getAllUsers`, `deleteUser`.

### High

✅ FIXED (Phase 2) **S5 — Admin passwords stored in plaintext.** `admins.mjs:9` does `admin.password !== password`;
`addAdmin` does `new Admin(req.body)` with no hashing.

✅ FIXED (Phase 2) **S6 — JWTs never expire.** `jwt.sign({ email }, SECRET)` with no `expiresIn`, no `jti`,
no revocation. A leaked token is valid forever.

✅ FIXED (Phase 2) **S7 — `getAllUsers` dumps the whole collection** — bcrypt hashes, emails, booking history —
to any authenticated caller (which, per S4, means anyone).

**S8 — Open mail relay.** `sendCodeVerification` sends a Gmail-authenticated email to any
address in `req.body`, unauthenticated and unthrottled.

**S9 — No rate limiting anywhere.** Login, signup and the mail endpoint are free to brute-force.

**S10 — CORS is fully open** (`app.use(cors())`, `index.mjs:20`), and the session secret is
the literal `'keyboard cat'` (express-session is also unused — delete it).

### Medium

- ✅ FIXED (Phase 3) **S11** Seat double-booking race: `book.mjs` sets `status: true` without asserting it was
  `false`. Two concurrent requests both succeed. The response is also sent _before_ the user
  history write, whose `.catch` then calls `res.status(500)` on an already-sent response →
  `ERR_HTTP_HEADERS_SENT` crash.
- **S12** Static bcrypt salt: `const salat = process.env.SALT` is reused for every password.
- **S13** 50 MB body limit, plus `uploadImage` writing an unvalidated base64 blob straight
  into Mongo — trivial DoS and unbounded document growth.
- **S14** No input validation; `req.body` values flow directly into query filters (NoSQL
  injection surface on every endpoint).
- **S15** Plaintext password kept in `sessionStorage` (`SignUp.jsx:80`) — readable by any XSS.
- **S16** Auth token in a JS-readable cookie via `js-cookie`, with no expiry handling.

### Low / correctness

- **S17** Broken filters: `User.findOneAndUpdate(email, …)` and
  `User.findOneAndDelete(req.params.email)` pass a string where a filter object is required.
- **S18** Most `.then()` chains have no `.catch()`; `mongoose.connect` is neither awaited nor
  error-handled; `mailFunction.mjs` swallows everything in an empty `catch {}`.
- **S19** `app.listen(process.env.PORT)` ignores the `PORT` fallback defined two lines above.
- **S20** `front/build/` is committed (19 files) despite `/build` being in `.gitignore`.

**Not a finding:** the PayPal `client-id` in `front/public/index.html` is a public identifier
by design. Leave it. Only the _secret_ must stay server-side.

---

## 3. Target structure

### 3.1 Backend — mirrors `portfolio-backend/src`

```
back/
├── src/
│   ├── app.ts                      # composition root (portfolio app.ts)
│   ├── server.ts                   # listen() split out so app.ts is testable
│   ├── config/
│   │   ├── env.ts                  # zod-validated process.env, fail fast at boot
│   │   ├── db.ts                   # cached connection (portfolio db.ts)
│   │   ├── security.ts             # corsMiddleware, authLimiter, bookingLimiter, mailLimiter
│   │   └── paypal.ts               # PayPal REST client + token cache
│   ├── routes/
│   │   ├── authRoutes.ts           # /api/auth
│   │   ├── userRoutes.ts           # /api/users
│   │   ├── adminRoutes.ts          # /api/admin
│   │   ├── tripRoutes.ts           # /api/trips
│   │   ├── bookingRoutes.ts        # /api/bookings
│   │   └── paymentRoutes.ts        # /api/payments
│   ├── controllers/                # req/res only — parse, delegate, respond
│   ├── services/                   # business logic, DB access, no req/res
│   ├── models/                     # User, Admin, Trip, Booking, VerificationToken
│   ├── middlewares/
│   │   ├── authMiddleware.ts       # protect  (portfolio parity)
│   │   ├── adminMiddleware.ts      # requireRole('admin')   <- fixes S4
│   │   ├── validate.ts             # zod body/params/query validator  <- fixes S14
│   │   ├── errorHandler.ts         # single funnel, no stack traces to client
│   │   └── notFound.ts
│   ├── validation/                 # zod schemas, one per resource
│   ├── utils/{ApiError.ts, jwt.ts, mailer.ts, asyncHandler.ts}
│   └── types/index.ts
├── tsconfig.json                   # copy portfolio's: ES2022 / NodeNext / strict
├── nodemon.json
└── .env.example
```

**One deliberate deviation from the portfolio.** In `portfolio-backend`, services receive
`(req, res)` and send the response themselves, which makes the controller a pass-through and
the service untestable. Here, services take plain arguments and **return data or throw
`ApiError`**; controllers own `req`/`res`. Same folders, same file names, better seams:

```ts
// services/tripService.ts
export const tripService = {
  async search(input: SearchInput): Promise<Trip[]> { … }   // returns, never responds
};

// controllers/tripController.ts
export const tripController = {
  search: asyncHandler(async (req, res) => {
    res.json({ trips: await tripService.search(req.validated.body) });
  }),
};
```

### 3.2 Frontend — portfolio conventions, SPA equivalents

| portfolio_frontend                   | front/src                                                  | why                                                 |
| ------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------- |
| `fetch/Fetch.ts`                     | `api/client.ts`                                            | one axios instance, interceptors, base URL from env |
| `actions/*.ts` (server actions)      | `services/*.ts`                                            | one module per resource, typed in/out               |
| `zod/*.ts`                           | `schemas/*.ts`                                             | shared with RHF via `zodResolver`                   |
| `types/{general,apiResponses}.ts`    | `types/{general,apiResponses}.ts`                          | identical convention                                |
| `hooks/`                             | `hooks/`                                                   | `useAuth`, `useTrips`, `useBookSeat`                |
| `components/forms/{Form,InputField}` | `components/forms/{Form,InputField,SelectField,DateField}` | same primitives, MUI-rendered                       |
| `middleware.ts` (route protection)   | `routes/ProtectedRoute.tsx`                                | SPA equivalent                                      |
| `utiles/showToast.ts`                | `utils/showToast.ts`                                       | same                                                |

```
front/
├── src/
│   ├── main.tsx
│   ├── api/            client.ts, endpoints.ts, queryClient.ts
│   ├── services/       authService.ts, userService.ts, tripService.ts,
│   │                   bookingService.ts, paymentService.ts
│   ├── schemas/        loginSchema.ts, signUpSchema.ts, searchSchema.ts,
│   │                   changePasswordSchema.ts, resetPasswordSchema.ts
│   ├── types/          general.ts, apiResponses.ts
│   ├── hooks/          useAuth.ts, useTrips.ts, useBookSeat.ts, useProfile.ts
│   ├── components/
│   │   ├── forms/      Form.tsx, InputField.tsx, SelectField.tsx, DateField.tsx
│   │   ├── general/    Navbar, Footer, ThemeToggle, LangSwitch, ErrorBoundary
│   │   ├── auth/       SignInForm, SignUpForm, VerifyForm, ResetPasswordForm
│   │   ├── trips/      TripList, TripCard, SeatMap, BookingDialog
│   │   ├── settings/   ProfileForm, PasswordForm, AvatarUpload
│   │   └── home/       Hero, Services, Payment, Faq, Stations
│   ├── pages/          one thin file per route, composition only
│   ├── routes/         index.tsx, ProtectedRoute.tsx, GuestRoute.tsx
│   ├── store/          authSlice.ts, uiSlice.ts   <- client state only
│   ├── theme/          index.ts, palette.ts, components.ts
│   ├── locales/        en.json, ar.json
│   └── utils/          showToast.ts, formatDate.ts
├── vite.config.ts
├── tsconfig.json
└── .env.example        VITE_API_URL, VITE_PAYPAL_CLIENT_ID
```

**Server state moves to TanStack Query.** Today, search results are pushed into a
`redux-persist`ed `trips` slice and written to `localStorage` — server data treated as app
state, stale by design. Redux keeps only what it should: auth status and UI preferences
(theme, language). The current slice mixes all three under the name `trips`.

---

## 4. React 19 features to actually use

Not a checklist to tick — each of these deletes existing code:

| Feature                              | Where                       | Replaces                                                                                          |
| ------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------- |
| **React Compiler** (babel plugin)    | build config                | all manual `useMemo`/`useCallback`                                                                |
| `useActionState` + `useFormStatus`   | `components/forms/Form.tsx` | the `loading` + `setTimeout(…, 1000)` pattern repeated in 8 components                            |
| `useOptimistic`                      | `SeatMap`                   | seat turns red instantly on booking, rolls back on failure                                        |
| `useTransition`                      | trip search                 | keeps the form responsive while results load                                                      |
| ref as prop                          | `MuiForm`, `Book`           | `forwardRef` (the `Transition` slide wrapper)                                                     |
| Document Metadata (`<title>` in JSX) | every page                  | no `react-helmet` needed                                                                          |
| `<Activity>` (19.2)                  | trips list                  | keeps results mounted when the booking dialog opens                                               |
| `useEffectEvent` (19.2)              | `Book.jsx` PayPal effect    | fixes the effect that renders a duplicate PayPal button on every price change and never cleans up |

Router moves to **react-router v7** (data router, `lazy` routes, `loader`/`action`).

---

## 5. Phased execution

Each phase is independently shippable and leaves the app running. Estimates assume solo work.

### Phase 0 — Baseline (½ day)

- `git rm -r --cached front/build`, confirm `.gitignore` (S20).
- **Rotate the Gmail app password and `JWT_SECRET`** — the deployed instance is compromised by S1.
- Write `back/.env.example`, `front/.env.example`.
- Capture the current API surface in `docs/api.md` so nothing is silently dropped.
- Add `husky` + `lint-staged` + `prettier` + `commitlint`, matching the portfolio's setup.

### Phase 1 — Backend TypeScript skeleton (1–2 days)

- `tsconfig.json` copied from `portfolio-backend` (ES2022, NodeNext, `strict: true`).
- Create the folder tree from §3.1; port models first (they're the cleanest code here).
- `config/env.ts` — zod-validate `process.env` at boot; refuse to start on a missing secret.
- `config/db.ts` — awaited, error-handled, cached (portfolio's version, verbatim).
- `errorHandler` + `notFound` + `asyncHandler` wired in `app.ts`. Fixes S18, S19.

### Phase 2 — Auth rewrite ⚠️ **critical, do not defer** (2–3 days)

- `VerificationToken` model: hashed code, `expiresAt` (10 min), `attempts`, single-use, bound
  to an email. Codes are **never returned in a response**. Fixes S1, S2.
- `crypto.randomInt` for code generation — the current `Math.random().toString(10)` is
  predictable and occasionally yields short codes.
- `bcrypt.hash(password, 12)` with a generated per-password salt. Fixes S12.
- Admin passwords hashed; add a `scripts/hashExistingAdmins.ts` one-off migration. Fixes S5.
- Merge `User` and `Admin` into one model with `role: 'user' | 'admin'`, or keep both and put
  `role` in the JWT claims — either way `adminMiddleware` enforces it. Fixes S4.
- Access token `expiresIn: '15m'`; refresh token rotated, hashed in DB, set as
  `httpOnly; Secure; SameSite=None` cookie. Add `POST /api/auth/refresh`, `POST /api/auth/logout`.
  Fixes S6, S16.
- `config/security.ts` — CORS allowlist from `ALLOWED_ORIGINS`, plus `authLimiter`,
  `mailLimiter`, `bookingLimiter` (portfolio's file is a direct template). Fixes S8, S9, S10.
- `helmet`; body limit down to `100kb` (image upload gets its own route and limit). Fixes S13.
- `express-mongo-sanitize` + the zod `validate` middleware on every route. Fixes S14.
- Delete `express-session`, `body-parser`, `local-storage`, `faker`; move `nodemon` to devDeps.
- `getAllUsers` → admin-only, paginated, `.select('-password -bookingsHistory')`. Fixes S7.
- Fix the broken filters in `updateInfo` / `deleteUser`. Fixes S17.

### Phase 3 — Trips, booking & payments (2–3 days)

- `Booking` model as a first-class entity (currently an array pushed onto the user document,
  with no ID, no status, no payment reference).
- Atomic seat reservation — a single `findOneAndUpdate` whose filter asserts `status: false`,
  so a losing concurrent request gets `null` and a clean 409. Fixes S11.
- **Payment flow** (fixes S3):
  1. `POST /api/payments/orders` — server reads the seat price **from the trip document**,
     creates the PayPal order, returns only the order ID.
  2. Seat moves to `reserved` with a short TTL so it can't be sold twice mid-checkout.
  3. `POST /api/payments/orders/:id/capture` — server captures via PayPal, verifies the
     captured amount and currency against the DB, then confirms the booking.
  4. A TTL index releases reservations that were never captured.
  - The client never sends a price, and `/bookings` stops accepting one.
- Ticket email moves to a queued, rate-limited send after capture succeeds.

### Phase 4 — Frontend: Vite + TypeScript + React 19 (2–3 days)

- New Vite scaffold, port `src/` across; delete `react-scripts` (unmaintained), `web-vitals`,
  `prop-types`, `styled-components` (its only use is one `StyledField` in `MuiForm.jsx`,
  trivially replaced by MUI `styled`).
- React 18 → 19.2, MUI 5 → 7, react-router 6 → 7, enable the React Compiler.
- `.js/.jsx` → `.ts/.tsx` module by module — leaf components first, `pages/` last.
- `theme/` extracted from `them.js`; typed MUI theme augmentation.
- Path aliases (`@/…`) to match the portfolio's import style.

### Phase 5 — Data layer (1–2 days)

- `api/client.ts` — one axios instance; request interceptor attaches the in-memory access
  token, response interceptor refreshes once on 401 and replays. Removes 12 hardcoded URLs.
- `services/*.ts` — one function per endpoint, `ApiResponse<T>` typed, mirroring the
  portfolio's one-file-per-operation `actions/` convention.
- TanStack Query for trips/profile/bookings; `store/` shrinks to `authSlice` + `uiSlice`.
- Drop `redux-persist` for server data; keep `localStorage` for theme/lang only.

### Phase 6 — Auth & routing (1 day)

- `AuthProvider` holds the access token **in memory only**; refreshes on mount and on 401.
- `ProtectedRoute` / `GuestRoute` wrappers; `/settings` stops rendering for anonymous users.
- Delete every `sessionStorage` write — especially the plaintext password. Fixes S15.
- Logout calls the API so the refresh token is actually revoked.

### Phase 7 — Forms & features (2–3 days)

- `components/forms/` primitives: `Form` (RHF + `zodResolver` + a `useFormStatus` submit
  button), `InputField`, `SelectField`, `DateField` — the portfolio's exact pattern, rendered
  with MUI.
- Migrate all 8 Formik forms; drop `formik`.
- `SeatMap` with `useOptimistic`; trip search with `useTransition`.
- `ErrorBoundary` at the router level, plus a real 404/500 page.
- Split `Navbar.jsx` (361 lines) into `Navbar` / `NavLinks` / `MobileDrawer` / `UserMenu`.
- Extract the 27 hardcoded city names into `constants/stations.ts`.

### Phase 8 — Quality & polish (2 days)

- **Backend:** Vitest + supertest + `mongodb-memory-server`. Non-negotiable coverage:
  password reset cannot be forged; a non-admin cannot reach `/api/admin/*`; a booking without
  a captured payment is rejected; two concurrent bookings of one seat → one 201 and one 409.
- **Frontend:** Vitest + Testing Library on the forms and `ProtectedRoute`; Playwright for
  search → select seat → pay → confirm.
- ESLint 9 flat config + `typescript-eslint`, matching the portfolio's `eslint.config.mjs`.
- GitHub Actions: typecheck → lint → test → build, on both workspaces.
- Rewrite `README.md` — the current one still advertises React 18, Formik, Redux and CRA.
- Optional: `Dockerfile` + `docker-compose.yml` (front + back + Mongo), like the portfolio's.

---

## 6. Order of work, if time is short

1. **Phase 2** — S1 alone justifies it. Anyone who reads the repo can take over any account.
2. **Phase 3 payments** — S3 is a money hole.
3. **Phase 0** plus secret rotation.
4. Everything else is craft, and craft is what a reviewer sees — but a reviewer who finds S1
   in a portfolio project stops reading.

**Rough total:** 12–18 focused days. Phases 1/4 and 3/5 can overlap if you want to alternate
between the two sides.

---

## 7. Dependency changes at a glance

**Backend — remove:** `body-parser` (Express has it built in), `express-session`,
`local-storage`, `faker`; move `nodemon` to devDependencies.
**Backend — add:** `typescript`, `tsx`, `zod`, `helmet`, `express-rate-limit`,
`express-mongo-sanitize`, `cookie-parser`, `@paypal/paypal-server-sdk`, `pino`, `vitest`,
`supertest`, `mongodb-memory-server`, `@types/*`.

**Frontend — remove:** `react-scripts`, `formik`, `styled-components`, `prop-types`,
`web-vitals`, `redux-persist`, `js-cookie`.
**Frontend — add:** `vite`, `@vitejs/plugin-react`, `typescript`, `react@19`,
`react-hook-form`, `@hookform/resolvers`, `zod`, `@tanstack/react-query`, `react-toastify`,
`babel-plugin-react-compiler`, `vitest`, `@testing-library/*`, `@playwright/test`.

**Frontend — keep:** MUI + Emotion, `@mui/x-date-pickers`, `dayjs`, `axios`,
`i18next`/`react-i18next`, `framer-motion`, `swiper`, `@reduxjs/toolkit` (slimmed),
`three` + `@react-three/fiber` (the Earth component).
