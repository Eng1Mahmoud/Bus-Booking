import { useEffect, useState, type ReactNode } from "react";
import { refreshAccessToken } from "@/api/client";

/**
 * Restores the session on page load.
 *
 * The access token lives in memory, so a reload loses it. What survives is the
 * httpOnly refresh cookie, which the browser sends to `/api/auth/refresh` and
 * JavaScript can never read. One call on mount turns that cookie back into an
 * access token.
 *
 * Nothing renders until that call settles. Without the wait, a guarded route
 * would see "no token" for a moment and bounce a signed-in user to the login
 * page on every refresh.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // A failure here is the normal case for a signed-out visitor, so it is not
    // an error — it just means there is no session to restore.
    void refreshAccessToken().finally(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return null;

  return <>{children}</>;
};
