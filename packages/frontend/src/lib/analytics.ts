/**
 * @file lib/analytics.ts
 * @description Plausible custom event helpers.
 *
 * Usage:
 *   import { trackEvent } from "@/lib/analytics";
 *   trackEvent("Wallet Connected");
 *   trackEvent("Payout Claimed", { org: "stellar" });
 *
 * Privacy guarantees:
 * - No PII is sent. Wallet addresses are SHA-256 hashed before use as props.
 * - Plausible does not use cookies or fingerprinting.
 */

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string> }) => void;
  }
}

/**
 * Hash a Stellar public key so it can be used as an analytics dimension
 * without exposing the raw address to the analytics server.
 */
export async function hashAddress(address: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(address);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

/**
 * Fire a Plausible custom event. Safe to call server-side (no-ops silently).
 */
export function trackEvent(
  event: string,
  props?: Record<string, string>
): void {
  if (typeof window === "undefined" || typeof window.plausible !== "function") {
    return;
  }
  window.plausible(event, props ? { props } : undefined);
}
