import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { login } from "../services/auth.service";

export function getLoginError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    return (
      error.response?.data?.message ?? error.message ?? "Unable to sign in"
    );
  }

  return "Something went wrong. Please try again.";
}

export function useLogin() {
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: login,
  });
}
