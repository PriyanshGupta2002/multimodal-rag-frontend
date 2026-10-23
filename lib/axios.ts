import axios, { type InternalAxiosRequestConfig } from "axios";
import {
  clearAccessTokenCookie,
  setAccessTokenCookie,
} from "@/lib/auth-session";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryConfig = InternalAxiosRequestConfig & { authRetry?: boolean };
type RefreshResponse = { access_token?: string };

let accessToken: string | null = null;
let refreshRequest: Promise<void> | null = null;

function isAuthEndpoint(url?: string): boolean {
  return ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some(
    (endpoint) => url?.includes(endpoint),
  );
}

async function refreshAccessToken(): Promise<void> {
  const { data } = await api.post<RefreshResponse>("/auth/refresh");
  if (!data.access_token) {
    throw new Error("The refresh response did not include an access token.");
  }

  await setAccessTokenCookie(data.access_token);
  accessToken = data.access_token;
}

api.interceptors.request.use((config) => {
  const isLoginOrRefresh =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/register") ||
    config.url?.includes("/auth/refresh");

  if (accessToken && !isLoginOrRefresh) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const request = error.config as RetryConfig | undefined;
    if (
      typeof window === "undefined" ||
      error.response?.status !== 401 ||
      !request ||
      request.authRetry ||
      isAuthEndpoint(request.url)
    ) {
      return Promise.reject(error);
    }

    request.authRetry = true;

    try {
      refreshRequest ??= refreshAccessToken();
      await refreshRequest;
      return api.request(request);
    } catch (refreshError) {
      accessToken = null;
      try {
        await clearAccessTokenCookie();
      } catch (clearError) {
        console.error("Could not clear the expired local session.", clearError);
      }

      const currentPath = `${window.location.pathname}${window.location.search}`;
      const isProtectedPath =
        window.location.pathname === "/dashboard" ||
        window.location.pathname === "/chat" ||
        window.location.pathname.startsWith("/chat/");
      if (isProtectedPath) {
        window.dispatchEvent(
          new CustomEvent("auth:expired", { detail: currentPath }),
        );
      }
      return Promise.reject(refreshError);
    } finally {
      refreshRequest = null;
    }
  },
);

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
