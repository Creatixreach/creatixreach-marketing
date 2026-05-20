import "server-only";
import { Resend } from "resend";

let cached: Resend | null = null;

export function getResend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[marketing-resend] RESEND_API_KEY not set, skipping sends");
    return null;
  }
  cached = new Resend(key);
  return cached;
}

export const FROM_SALES = "CreatixReach <no-reply@creatixreach.io>";
