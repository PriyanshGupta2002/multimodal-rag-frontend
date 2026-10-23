"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    function handleExpiredSession(event: Event) {
      const nextPath = (event as CustomEvent<string>).detail;
      const next = nextPath
        ? `?next=${encodeURIComponent(nextPath)}`
        : "";
      router.replace(`/sign-in${next}`);
    }

    window.addEventListener("auth:expired", handleExpiredSession);
    return () => {
      window.removeEventListener("auth:expired", handleExpiredSession);
    };
  }, [router]);

  return null;
}
