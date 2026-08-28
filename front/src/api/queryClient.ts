import { QueryClient } from "@tanstack/react-query";

/**
 * Server state lives here from now on, not in Redux.
 *
 * Search results used to be pushed into a redux-persist slice and written to
 * localStorage, so a returning visitor saw seat availability captured days
 * earlier with no way for it to expire.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Seat availability changes underneath us, so nothing is fresh for long.
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  profile: ["profile"] as const,
  trips: (from: string, to: string, date: string) => ["trips", from, to, date] as const,
};
