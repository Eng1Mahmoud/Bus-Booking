import React,{lazy,Suspense} from "react";
import { createBrowserRouter } from "react-router-dom";
import { SignInPage } from "./pages/SignInPage"
import { SignUpPage } from "./pages/SignUpPage"; 
import { Root } from  "./pages/Root"
import {FallbackLoading} from "./components/general/FallbackLoading";
import NotFound from "./pages/NotFound"
import {ForgetPassword} from "./pages/ForgetPassword";
import {NewPassword} from "./pages/NewPassword"
const Home = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const StationsPage = lazy(() => import("./pages/StationsPage"));
const VerificationPage = lazy(() => import("./pages/verificationPage"));
const TripsPage = lazy(() => import("./pages/TripsPage"));


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        path: "/",
        element: <Suspense fallback={<FallbackLoading/>}><Home /></Suspense>,
      },
      {
        path: "faqs",
        element: <Suspense fallback={<FallbackLoading/>}><FaqPage /></Suspense>,
      },
      {
        path: "about us",
        element: <Suspense fallback={<FallbackLoading/>}><AboutPage /></Suspense>,
      },
      {
        path: "settings",
        element: <Suspense fallback={<FallbackLoading/>}><SettingsPage /></Suspense>,
      },
      {
        path: "stations",
        element: <Suspense fallback={<FallbackLoading/>}><StationsPage /></Suspense>,
      },
      {
        path: "trips",
        element: <Suspense fallback={<FallbackLoading/>}><TripsPage /></Suspense>,
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
    element: <Suspense fallback={<FallbackLoading/>}><VerificationPage /></Suspense>,
  },
  {
    path: "ForgetPassword",
    element: <ForgetPassword/>,
  },
  {
    path: "NewPassword",
    element: <NewPassword/>,
  },
  {
  path:"*",
  element:<NotFound/>
  }
]);
