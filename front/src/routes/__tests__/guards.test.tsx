import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { GuestRoute, ProtectedRoute } from "../guards";
import { clearAccessToken, setAccessToken } from "@/api/tokenStore";

/**
 * Before these guards, /settings mounted for anyone who typed the URL and every
 * component ran its own `Cookies.get("token")` check that controlled nothing.
 */
const routes = [
  {
    element: <ProtectedRoute />,
    children: [{ path: "/settings", element: <p>Account settings</p> }],
  },
  {
    element: <GuestRoute />,
    children: [{ path: "/login", element: <p>Sign in</p> }],
  },
  { path: "/", element: <p>Home</p> },
];

const renderAt = (path: string) =>
  render(
    <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />,
  );

afterEach(() => clearAccessToken());

describe("ProtectedRoute", () => {
  it("sends an anonymous visitor to the login page", async () => {
    renderAt("/settings");

    expect(await screen.findByText("Sign in")).toBeInTheDocument();
    expect(screen.queryByText("Account settings")).not.toBeInTheDocument();
  });

  it("lets a signed-in visitor through", async () => {
    setAccessToken("a-token");
    renderAt("/settings");

    expect(await screen.findByText("Account settings")).toBeInTheDocument();
  });
});

describe("GuestRoute", () => {
  it("keeps a signed-in visitor off the login page", async () => {
    setAccessToken("a-token");
    renderAt("/login");

    expect(await screen.findByText("Home")).toBeInTheDocument();
  });

  it("shows the login page to an anonymous visitor", async () => {
    renderAt("/login");

    expect(await screen.findByText("Sign in")).toBeInTheDocument();
  });
});
