# Current API surface (pre-refactor baseline)

Captured before any refactoring so that no endpoint is silently dropped during
the migration. Base URL in production: `https://booking-bus.onrender.com`

**Conventions today:** no `/api` prefix, mixed casing (`/SignUp`, `/AddTrip`),
verbs in paths (`/getUser`, `/deleteTrip`), `POST` used for reads, and a
`verifyToken` middleware that checks only that a JWT is well-signed — it does
not distinguish users from admins.

The right-hand column is the Phase 1–3 target. Frontend call sites are listed so
each one can be ticked off during Phase 5.

---

## Users — `back/routes/user.mjs`

| Now                          | Auth  | Target                                    |
| ---------------------------- | ----- | ----------------------------------------- |
| `POST /SignUp`               | —     | `POST /api/auth/register`                 |
| `POST /verification`         | —     | `POST /api/auth/verify-email`             |
| `POST /login`                | —     | `POST /api/auth/login`                    |
| `POST /sendCodeVerification` | —     | `POST /api/auth/forgot-password`          |
| `POST /newPassword`          | —     | `POST /api/auth/reset-password`           |
| `POST /getUser`              | token | `GET /api/users/me`                       |
| `POST /updateInfo`           | token | `PATCH /api/users/me`                     |
| `POST /changePassword`       | token | `PATCH /api/users/me/password`            |
| `POST /uploadImage`          | token | `PUT /api/users/me/avatar`                |
| `GET /getAllUsers`           | token | `GET /api/admin/users` (admin, paginated) |
| `DELETE /deleteUser/:email`  | token | `DELETE /api/admin/users/:id` (admin)     |

### `POST /SignUp`

Request `{ FName, LName, email, password }`
Response `{ exist: false, verification_code, user }` — or `{ exist: true, message }`

> **S2.** Returns the verification code _and the submitted user object_ (password
> included) to the browser. `SignUp.jsx:79-80` stores both in `sessionStorage`.
> Nothing is persisted at this step; the account is created by `/verification`.

### `POST /verification`

Request `{ verificationCode, verification_code, user }`
Response `{ verification: bool, message }`

> **S2.** Compares two client-supplied values, then saves the client-supplied
> `user` object wholesale. The email is never proven to belong to the caller.

### `POST /login`

Request `{ email, password }`
Response `{ exist: bool, message, token }`

> **S6.** Token is `jwt.sign({ email }, SECRET)` — no `expiresIn`, no role claim.

### `POST /sendCodeVerification`

Request `{ email }`
Response `{ send: true, email, verification_code }`

> **S1 / S8.** Returns the reset code in the response body, and will email any
> address supplied, unauthenticated and unthrottled.

### `POST /newPassword`

Request `{ email, password, verificationCode, verification_code }`
Response `{ verification: bool, message, user }`

> **S1 — CRITICAL.** `verificationCode` and `verification_code` both come from
> `req.body`. Any matching pair resets any account.

### `POST /getUser`

Request — none, identified by token. Response `{ message, result }`

> Returns the full user document including the bcrypt hash.

### `POST /updateInfo`

Request `{ FName, LName, email }`

> **S17.** `User.findOneAndUpdate(email, …)` passes a string where a filter
> object is required.

### `POST /changePassword`

Request `{ password, newPassword }`
Response `{ result: { message, match } }`

### `POST /uploadImage`

Request `{ image }` — base64 data URL, written straight into the user document.

> **S13.** No size or MIME validation, under a 50 MB body limit.

### `GET /getAllUsers`

> **S7.** Entire collection — hashes, emails, booking history — to any caller
> holding any valid token.

### `DELETE /deleteUser/:email`

> **S17.** `findOneAndDelete(req.params.email)` — string instead of a filter.

---

## Search — `back/routes/search.mjs`

| Now            | Auth | Target                                  |
| -------------- | ---- | --------------------------------------- |
| `POST /search` | —    | `GET /api/trips/search?from=&to=&date=` |

Request `{ from, to, date }` where `date` is `YYYY-M-D`. Response: array of trips.

> Date is stored as a **string**, so no range queries and no timezone handling.
> Phase 3 migrates it to a real `Date`. No validation on any field.

---

## Bookings — `back/routes/book.mjs`

| Now          | Auth  | Target                                                                |
| ------------ | ----- | --------------------------------------------------------------------- |
| `POST /book` | token | `POST /api/payments/orders` + `POST /api/payments/orders/:id/capture` |

Request `{ from, to, date, busNumber, seatNumber, seatePrice }`

> **S3 — CRITICAL.** `seatePrice` is supplied by the client and the server never
> contacts PayPal. Calling this endpoint directly books a free seat.
> **S11.** Sets `status: true` without asserting it was `false` (double-booking
> race), and responds _before_ writing the user's booking history — whose error
> path then calls `res.status(500)` on an already-sent response.

---

## Admin — `back/routes/admins.mjs`, `back/routes/trips.mjs`

| Now                                                   | Auth  | Target                                           |
| ----------------------------------------------------- | ----- | ------------------------------------------------ |
| `POST /admin/login`                                   | —     | `POST /api/auth/login` (unified, role in claims) |
| `GET /admin/getAdmins`                                | token | `GET /api/admin/admins`                          |
| `POST /admin/addAdmin`                                | token | `POST /api/admin/admins`                         |
| `DELETE /admin/deleteAdmin/:email`                    | token | `DELETE /api/admin/admins/:id`                   |
| `GET /admin/getTrips`                                 | token | `GET /api/trips`                                 |
| `POST /admin/AddTrip`                                 | token | `POST /api/admin/trips`                          |
| `DELETE /admin/deleteTrip/:from/:to/:date/:busNumber` | token | `DELETE /api/admin/trips/:tripId/buses/:busId`   |
| `POST /admin/book`                                    | token | `POST /api/admin/bookings`                       |

> **S4 — CRITICAL.** Every row above is protected by the same `verifyToken` that
> guards the user routes. Any registered user's token authorizes all of them.
> **S5.** `POST /admin/login` compares `admin.password !== password` — admin
> passwords are stored in plaintext, and `addAdmin` saves `req.body` unhashed.
> **S12.** `deleteTrip` keys on four positional URL params instead of an ID.

---

## Misc

| Now                               | Target                                       |
| --------------------------------- | -------------------------------------------- |
| `GET /` — returns `"Hello World"` | `GET /api/health` — uptime + DB connectivity |

---

## Frontend call sites to migrate (Phase 5)

All twelve hardcode `https://booking-bus.onrender.com`:

| File                                        | Endpoint                |
| ------------------------------------------- | ----------------------- |
| `components/SignIn.jsx:69`                  | `/login`                |
| `components/SignUp.jsx:74`                  | `/SignUp`               |
| `components/verification.jsx:36`            | `/verification`         |
| `pages/ForgetPassword.jsx:32`               | `/sendCodeVerification` |
| `pages/NewPassword.jsx:37`                  | `/newPassword`          |
| `components/general/Navbar.jsx:92`          | `/getUser`              |
| `components/settings/TabsEdit.jsx:52`       | `/getUser`              |
| `components/settings/ChangeInfo.jsx:36`     | `/updateInfo`           |
| `components/settings/ChangePassword.jsx:34` | `/changePassword`       |
| `components/settings/ChangeImage.jsx:35`    | `/uploadImage`          |
| `components/MuiForm.jsx:87`                 | `/search`               |
| `components/Trips/Book.jsx:29`              | `/book`                 |

No admin dashboard exists in this repo — the admin endpoints are consumed by a
separate frontend.
