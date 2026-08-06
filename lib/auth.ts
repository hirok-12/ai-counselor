export const AUTH_COOKIE = "app-auth";

/** パスワードから Cookie 用トークンを導出（SHA-256 hex） */
export async function passwordToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`ai-counselor:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
