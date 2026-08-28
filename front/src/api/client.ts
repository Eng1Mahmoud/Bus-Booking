import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";

/**
 * The one HTTP client.
 *
 * Twelve components each built their own `axios.post` against a hardcoded
 * `https://booking-bus.onrender.com`, so changing environment meant editing
 * twelve files and every call site repeated its own auth header.
 *
 * Empty base URL in development: `vite.config.ts` proxies `/api` to the API on
 * :5000, so requests are same-origin and CORS never enters the picture.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
  // Required for the refresh cookie to travel to the API on another origin.
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * A single refresh, shared by every request that hits a 401 at once.
 *
 * Without this, a page that fires four requests on mount would send four
 * refreshes, and rotation would treat three of them as replays of an already
 * used token — which the API deliberately punishes by revoking the session.
 */
let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  refreshInFlight ??= (async () => {
    try {
      const { data } = await axios.post<{ token: string }>(
        `${import.meta.env.VITE_API_URL || ""}/api/auth/refresh`,
        {},
        { withCredentials: true },
      );
      setAccessToken(data.token);
      return data.token;
    } catch {
      clearAccessToken();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
};

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;

    // Retry once, and never for the refresh call itself — that would loop.
    if (
      error.response?.status !== 401 ||
      !config ||
      config._retried ||
      config.url?.includes("/api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    config._retried = true;
    const token = await refreshAccessToken();

    if (!token) {
      return Promise.reject(error);
    }

    config.headers.Authorization = `Bearer ${token}`;
    return api.request(config);
  },
);

export { refreshAccessToken };

/** Pulls a readable message out of an error, whatever shape it arrived in. */
export const errorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
};
