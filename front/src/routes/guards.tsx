import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Route guards.
 *
 * Authorisation still lives on the server — these only decide what to render.
 * Before them, `/settings` mounted for anyone who typed the URL and every
 * component made its own `Cookies.get("token")` check, so "am I signed in?"
 * was answered in six places and none of them controlled routing.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // `state` carries where they were going, so login can send them back
    // rather than dumping them on the home page.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

/** Keeps a signed-in visitor off the login and register screens. */
export const GuestRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
