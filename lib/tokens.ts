import { randomBytes } from "crypto";

/** URL-safe random token used as a capability: possession of it grants access. */
export function generateToken(): string {
  return randomBytes(18).toString("base64url");
}
