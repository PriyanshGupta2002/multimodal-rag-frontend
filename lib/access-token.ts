export function getAccessTokenExpiry(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: unknown };

    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isAccessTokenValid(token: string | undefined): token is string {
  if (!token) return false;

  const expiresAt = getAccessTokenExpiry(token);
  return expiresAt !== null && expiresAt > Math.floor(Date.now() / 1000);
}
