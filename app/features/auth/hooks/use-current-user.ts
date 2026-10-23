import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../services/auth.service";

export const currentUserQueryKey = ["auth", "me"];

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    retry: false,
    enabled,
  });
}
