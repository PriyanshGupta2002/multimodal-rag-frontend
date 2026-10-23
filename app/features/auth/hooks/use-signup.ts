import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { signup } from "../services/auth.service";
import type { SignupRequest } from "../types/auth.types";

export function getSignupError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.detail ??
      error.response?.data?.message ??
      error.message ??
      "Unable to create account"
    );
  }

  return "Something went wrong. Please try again.";
}

export function useSignup() {
  return useMutation({
    mutationKey: ["auth", "signup"],
    mutationFn: (payload: SignupRequest) => signup(payload),
  });
}
