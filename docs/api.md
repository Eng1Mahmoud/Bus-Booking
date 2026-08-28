# API reference

Base URL in production: `https://booking-bus.onrender.com`

All responses are JSON. Errors share one shape:

```json
{
  "message": "Validation failed",
  "details": [{ "field": "email", "message": "Invalid email address" }]
}
```

`details` is present only for validation failures.

Authentication is a bearer access token in the `Authorization` header. The
token is short-lived; a rotating refresh token is held in an httpOnly cookie
scoped to `/api/auth` and exchanged through `POST /api/auth/refresh`.

---

## Auth — `/api/auth`

| Method | Path               | Auth   | Body                                    |
| ------ | ------------------ | ------ | --------------------------------------- |
| `POST` | `/register`        | —      | `FName`, `LName`, `email`, `password`   |
| `POST` | `/verify-email`    | —      | `verificationCode`, `user.email`        |
| `POST` | `/login`           | —      | `email`, `password`                     |
| `POST` | `/forgot-password` | —      | `email`                                 |
| `POST` | `/reset-password`  | —      | `email`, `password`, `verificationCode` |
| `POST` | `/refresh`         | cookie | —                                       |
| `POST` | `/logout`          | cookie | —                                       |

`register` emails a code and stores the pending signup; the account is created
by `verify-email`. `forgot-password` answers identically whether or not the
address is registered.

`login` returns `{ exist, message, token }` and sets the refresh cookie.
A wrong credential is a 200 with `exist: false`, not a 401.

---

## Users — `/api/users`

| Method   | Path           | Auth  | Body                      |
| -------- | -------------- | ----- | ------------------------- |
| `GET`    | `/me`          | token | —                         |
| `PATCH`  | `/me`          | token | `FName`, `LName`, `email` |
| `PATCH`  | `/me/password` | token | `password`, `newPassword` |
| `PUT`    | `/me/avatar`   | token | `image` — base64 data URL |
| `GET`    | `/`            | admin | — · `?page=&limit=`       |
| `DELETE` | `/:email`      | admin | —                         |

`/me` endpoints act on the token's own account; the caller cannot name another.
Avatars are capped at roughly 1 MB and must be PNG, JPEG, WebP or GIF.

`PATCH /me/password` returns `{ result: { message, match } }` — `match: false`
means the current password was wrong.

---

## Trips — `/api/trips`

| Method | Path      | Auth  | Body                 |
| ------ | --------- | ----- | -------------------- |
| `POST` | `/search` | —     | `from`, `to`, `date` |
| `GET`  | `/`       | token | —                    |

`date` is `YYYY-M-D` with no zero padding. `search` answers with a bare array.

---

## Payments — `/api/payments`

| Method | Path                       | Auth  | Body                                            |
| ------ | -------------------------- | ----- | ----------------------------------------------- |
| `POST` | `/orders`                  | token | `from`, `to`, `date`, `busNumber`, `seatNumber` |
| `POST` | `/orders/:orderId/capture` | token | —                                               |
| `POST` | `/orders/:orderId/cancel`  | token | —                                               |

Checkout is two steps. `orders` reads the seat price from the trip, holds the
seat for ten minutes and creates the PayPal order, returning only an order id —
the client never sends an amount. `capture` captures through PayPal and checks
the captured sum and currency against the order before the booking is confirmed.
`cancel` releases the hold when the customer backs out.

A seat already held or sold returns 409. Returns 503 if PayPal is not configured.

---

## Bookings — `/api/bookings`

| Method | Path | Auth  |
| ------ | ---- | ----- |
| `GET`  | `/`  | token |

The caller's own paid bookings. There is deliberately no `POST`: a booking is
created only as the side effect of a captured payment, or of an admin counter
sale.

---

## Admin — `/api/admin`

| Method   | Path                                | Auth  |
| -------- | ----------------------------------- | ----- |
| `POST`   | `/login`                            | —     |
| `GET`    | `/admins`                           | admin |
| `POST`   | `/admins`                           | admin |
| `DELETE` | `/admins/:email`                    | admin |
| `GET`    | `/trips`                            | admin |
| `POST`   | `/trips`                            | admin |
| `DELETE` | `/trips/:from/:to/:date/:busNumber` | admin |
| `POST`   | `/bookings`                         | admin |

`POST /admin/bookings` is a counter sale — a ticket paid for offline. It is the
only route that marks a seat sold without PayPal, and the price still comes from
the trip document.

Deleting the last remaining admin is refused.

---

## Health

| Method | Path          | Auth |
| ------ | ------------- | ---- |
| `GET`  | `/api/health` | —    |

Returns 200 when the database is reachable, 503 when it is not, so a platform
health check pulls a degraded instance out of rotation.

---

## Deprecated paths

The endpoints the original frontend used (`/login`, `/SignUp`, `/search`,
`/getUser`, `/admin/getTrips` and the rest) are still served as aliases and
delegate to the same controllers. They will be removed once no deployed client
calls them. `POST /book` is already gone and returns 410.
