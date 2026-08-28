import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import { Root } from "@/pages/Root";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { ForgetPassword } from "@/pages/ForgetPassword";
import { NewPassword } from "@/pages/NewPassword";
import NotFound from "@/pages/NotFound";
import { FallbackLoading } from "@/components/general/FallbackLoading";
import { GuestRoute, ProtectedRoute } from "./guards";
import { ErrorBoundary } from "@/components/general/ErrorBoundary";

const Home = lazy(() => import("@/pages/HomePage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const FaqPage = lazy(() => import("@/pages/FaqPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const StationsPage = lazy(() => import("@/pages/StationsPage"));
const VerificationPage = lazy(() => import("@/pages/verificationPage"));
const TripsPage = lazy(() => import("@/pages/TripsPage"));

const deferred = (element: ReactNode): ReactNode => (
  <Suspense fallback={<FallbackLoading />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: deferred(<Home />) },
      { path: "faqs", element: deferred(<FaqPage />) },
      /**
       * The path used to be "about us", with a literal space, which browsers
       * percent-encode to `/about%20us`. Renamed, with the old path kept as an
       * alias so existing links and bookmarks still resolve.
       */
      { path: "about-us", element: deferred(<AboutPage />) },
      { path: "about us", element: deferred(<AboutPage />) },
      { path: "stations", element: deferred(<StationsPage />) },
      { path: "trips", element: deferred(<TripsPage />) },

      // Settings reads and writes the signed-in account, so it must not mount
      // for an anonymous visitor who types the URL.
      {
        element: <ProtectedRoute />,
        children: [{ path: "settings", element: deferred(<SettingsPage />) }],
      },
    ],
  },

  // Signing in while already signed in is a dead end; these bounce home.
  {
    element: <GuestRoute />,
    children: [
      { path: "login", element: <SignInPage /> },
      { path: "register", element: <SignUpPage /> },
      { path: "verification", element: deferred(<VerificationPage />) },
      { path: "ForgetPassword", element: <ForgetPassword /> },
      { path: "NewPassword", element: <NewPassword /> },
    ],
  },

  { path: "*", element: <NotFound /> },
]);

export default router;
