import { useSyncExternalStore } from "react";
import { getAccessToken, onAccessTokenChange } from "@/api/tokenStore";

/**
 * Reads the in-memory access token as React state.
 *
 * `useSyncExternalStore` is the supported way to subscribe to a value that
 * lives outside React — the token deliberately does not live in component
 * state, because the axios interceptor needs it synchronously on every request.
 */
export const useAuth = () => {
  const token = useSyncExternalStore(onAccessTokenChange, getAccessToken, () => null);

  return { token, isAuthenticated: token !== null };
};
