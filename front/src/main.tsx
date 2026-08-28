import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import "./App.css";
import "./i18n";
import { router } from "@/routes";
import { store } from "@/store";
import { queryClient } from "@/api/queryClient";

const container = document.getElementById("root");

if (!container) {
  throw new Error("No #root element — check index.html");
}

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
