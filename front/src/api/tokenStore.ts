/**
 * The access token lives here, in a module variable, and nowhere else.
 *
 * It used to sit in a `js-cookie` cookie, which any injected script could read.
 * Holding it in memory means an XSS has to run *while the tab is open* to steal
 * it, and it dies with the page. The long-lived credential — the refresh token —
 * is an httpOnly cookie the browser will not let JavaScript touch at all.
 *
 * The cost is that a refresh is needed on every page load. `AuthProvider`
 * (Phase 6) does that against `POST /api/auth/refresh` before rendering.
 */
let accessToken: string | null = null;

type Listener = (token: string | null) => void;
const listeners = new Set<Listener>();

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
  listeners.forEach((listener) => listener(token));
};

export const clearAccessToken = (): void => setAccessToken(null);

/** Lets React state follow the token without the token living in React state. */
export const onAccessTokenChange = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
