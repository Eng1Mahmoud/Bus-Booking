import { createBrowserRouter } from "react-router-dom";
import { SignInPage } from "./pages/SignInPage"
import { SignUpPage } from "./pages/SignUpPage"; 
import { Home } from "./pages/HomePage"
import { Root } from  "./pages/Root"
import { FaqPage } from  "./pages/FaqPage"
import {AboutPage } from  "./pages/AboutPage"
import {SettingsPage} from "./pages/SettingsPage"
import { StationsPage } from "./pages/StationsPage";
import { VerificationPage } from "./pages/verificationPage"; 
import { TripsPage } from "./pages/TripsPage";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        path: "/",
        element: <Home />,
      },
      {
        path: "faqs",
        element: <FaqPage/>,
      },
      {
        path: "about us",
        element: <AboutPage/>,
      },
      {
        path: "settings",
        element: <SettingsPage/>,
      },
      {
        path: "stations",
        element: <StationsPage/>,
      },
      {
        path: "trips",
        element: <TripsPage/>,
      }
    ],
  },
  {
    path: "login",
    element: <SignInPage />,
  },
  {
    path: "register",
    element: <SignUpPage />,
  },
  {
    path: "verification",
    element: <VerificationPage />,
  },
]);
