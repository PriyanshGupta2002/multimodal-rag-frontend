async function updateSessionCookie(
  method: "POST" | "DELETE",
  accessToken?: string,
): Promise<void> {
  const response = await fetch("/api/auth/session", {
    method,
    headers: accessToken
      ? { "Content-Type": "application/json" }
      : undefined,
    body: accessToken ? JSON.stringify({ access_token: accessToken }) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload: unknown = await response.json();
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Could not update the sign-in session.";
    throw new Error(message);
  }
}

export function setAccessTokenCookie(accessToken: string): Promise<void> {
  return updateSessionCookie("POST", accessToken);
}

export function clearAccessTokenCookie(): Promise<void> {
  return updateSessionCookie("DELETE");
}
