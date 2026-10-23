import { api, setAccessToken } from "@/lib/axios";
import {
  clearAccessTokenCookie,
  setAccessTokenCookie,
} from "@/lib/auth-session";
import type {
  LoginRequest,
  LoginResponse,
  CurrentUser,
  SignupRequest,
  SignupResponse,
} from "../types/auth.types";

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>("/auth/me");
  return data;
}

export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const { data } = await api.post<SignupResponse>("/auth/register", payload);

  return data;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);

  if (!data.access_token) {
    throw new Error("The sign-in response did not include an access token.");
  }

  try {
    await setAccessTokenCookie(data.access_token);
    setAccessToken(data.access_token);
  } catch (error) {
    setAccessToken(null);
    throw error;
  }

  return data;
}

export async function logout(): Promise<{ serverLogoutSucceeded: boolean }> {
  let serverLogoutSucceeded = true;

  try {
    await api.post("/auth/logout");
  } catch {
    serverLogoutSucceeded = false;
  }

  setAccessToken(null);
  await clearAccessTokenCookie();

  return { serverLogoutSucceeded };
}
