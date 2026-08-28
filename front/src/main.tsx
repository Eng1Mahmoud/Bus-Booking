import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";

import "./index.css";
import "./App.css";
import "./i18n";
import { router } from "@/routes";
import { store } from "@/store";

const container = document.getElementById("root");

if (!container) {
  throw new Error("No #root element — check index.html");
}

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
