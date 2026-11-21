import { z } from "zod";
import type { QuoteContext } from "./context";
import type { QuoteLine } from "./store";

/**
 * Validation for sending a quote request (Design Doc 10, T8 rules; Plan
 * AT-05). Returns field-level error codes; the UI maps codes to copy and
 * builds the error summary from them.
 */
export const REPLY_CHANNELS = ["whatsapp", "phone", "email"] as const;
export type ReplyChannel = (typeof REPLY_CHANNELS)[number];

export type Contact = {
  name: string;
  company: string;
  phone: string;
  email: string;
  replyBy: ReplyChannel;
  /** Honeypot: humans never see or fill it (replaces the math CAPTCHA, Plan A07). */
  website: string;
};

export const EMPTY_CONTACT: Contact = { name: "", company: "", phone: "", email: "", replyBy: "whatsapp", website: "" };

export type FieldId = "items" | "need" | "emirate" | "country" | "name" | "phone" | "email";
export type ErrorCode =
  | "noItems"
  | "needRequired"
  | "emirateRequired"
  | "countryRequired"
  | "nameRequired"
  | "phoneRequired"
  | "phoneInvalid"
  | "emailRequired"
  | "emailInvalid";
export type FieldError = { field: FieldId; code: ErrorCode };

/**
 * E.164 check: any country code, written with spaces, dashes or brackets.
 * "+971 50 123 4567" → "+971501234567"; "00254 712 345 678" → "+254712345678".
 * Numbers without a country code are rejected (the hint says to add one).
 */
export function normalisePhone(raw: string): string | null {
  const compact = raw.trim().replace(/[\s().-]/g, "");
  const digits = compact.startsWith("+") ? compact.slice(1) : compact.startsWith("00") ? compact.slice(2) : null;
  if (!digits || !/^[1-9]\d{7,14}$/.test(digits)) return null;
  return `+${digits}`;
}

const isEmail = (v: string) => z.email().safeParse(v.trim()).success;

/**
 * mode "enquiry": everything the request needs.
 * mode "whatsapp": the chat itself is the reply channel, so name and
 * contact fields are optional; items and the need are still required.
 */
export function validateRequest(
  lines: QuoteLine[],
  context: QuoteContext,
  contact: Contact,
  mode: "enquiry" | "whatsapp",
): FieldError[] {
  const errors: FieldError[] = [];
  if (!lines.length) errors.push({ field: "items", code: "noItems" });
  if (!context.need) errors.push({ field: "need", code: "needRequired" });
  if (context.need === "install" && !context.emirate) errors.push({ field: "emirate", code: "emirateRequired" });
  if (context.need === "export" && !context.country?.trim()) errors.push({ field: "country", code: "countryRequired" });

  if (mode === "enquiry") {
    if (!contact.name.trim()) errors.push({ field: "name", code: "nameRequired" });
    const phone = contact.phone.trim();
    const email = contact.email.trim();
    if (phone && !normalisePhone(phone)) errors.push({ field: "phone", code: "phoneInvalid" });
    else if (!phone && contact.replyBy !== "email") errors.push({ field: "phone", code: "phoneRequired" });
    if (email && !isEmail(email)) errors.push({ field: "email", code: "emailInvalid" });
    else if (!email && contact.replyBy === "email") errors.push({ field: "email", code: "emailRequired" });
  }
  return errors;
}
