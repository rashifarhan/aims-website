import { describe, expect, it } from "vitest";
import en from "@/i18n/messages/en.json";
import { needFromSearch } from "./context";
import { messageLabels } from "./labels";
import { buildQuoteMessage, makeReference } from "./message";
import { EMPTY_CONTACT, normalisePhone, validateRequest, type Contact } from "./request";
import { EMPTY_QUOTE, quoteReducer, type QuoteLine } from "./store";

const lines: QuoteLine[] = [
  { kind: "product", slug: "f18", qty: 12 },
  { kind: "product", slug: "al-m280", qty: 12 },
  { kind: "custom", id: "c1", text: "XYZ-999", qty: 2 },
];
const products = { f18: { name: "ZKTeco F18", model: "F18" }, "al-m280": { name: "Alpha AL M280", model: "AL M280" } };
const labels = messageLabels(en.quote);

describe("phone numbers (AT-05)", () => {
  it("accepts any country code, written with spaces", () => {
    expect(normalisePhone("+971 50 123 4567")).toBe("+971501234567");
    expect(normalisePhone("+254 712 345 678")).toBe("+254712345678");
    expect(normalisePhone("00971-50-123-4567")).toBe("+971501234567");
  });

  it("rejects numbers without a country code or with letters", () => {
    expect(normalisePhone("050 123 4567")).toBeNull();
    expect(normalisePhone("+971 50 CALL ME")).toBeNull();
    expect(normalisePhone("+12")).toBeNull();
  });
});

describe("validation", () => {
  const contact = (c: Partial<Contact>): Contact => ({ ...EMPTY_CONTACT, ...c });

  it("AT-05: an empty request lists every missing field", () => {
    expect(validateRequest([], {}, EMPTY_CONTACT, "enquiry").map((e) => e.code)).toEqual([
      "noItems",
      "needRequired",
      "nameRequired",
      "phoneRequired",
    ]);
  });

  it("asks for the emirate when installing and the country when exporting", () => {
    expect(validateRequest(lines, { need: "install" }, contact({}), "whatsapp")).toEqual([
      { field: "emirate", code: "emirateRequired" },
    ]);
    expect(validateRequest(lines, { need: "export", country: " " }, contact({}), "whatsapp")).toEqual([
      { field: "country", code: "countryRequired" },
    ]);
  });

  it("email is optional when WhatsApp or phone is given, required when chosen as the channel", () => {
    const ok = contact({ name: "Rashid", phone: "+971 50 123 4567" });
    expect(validateRequest(lines, { need: "supply" }, ok, "enquiry")).toEqual([]);
    expect(validateRequest(lines, { need: "supply" }, { ...ok, replyBy: "email" }, "enquiry")).toEqual([
      { field: "email", code: "emailRequired" },
    ]);
    expect(validateRequest(lines, { need: "supply" }, { ...ok, email: "not-an-email" }, "enquiry")).toEqual([
      { field: "email", code: "emailInvalid" },
    ]);
  });

  it("WhatsApp needs items and the need, not contact details", () => {
    expect(validateRequest(lines, { need: "supply" }, EMPTY_CONTACT, "whatsapp")).toEqual([]);
  });
});

describe("message (AT-02)", () => {
  it("export to Kenya carries every line, quantity, the destination and the buyer type", () => {
    const msg = buildQuoteMessage({
      reference: "Q-2611-0042",
      lines,
      products,
      context: { need: "export", country: "Kenya", port: "Mombasa", buyerType: "distributor", timing: "two-weeks" },
      contact: { name: "Amina", company: "Nairobi Secure Ltd", replyBy: "whatsapp" },
      labels,
    });
    expect(msg).toBe(
      [
        "Hi AIMS, quote request (ref Q-2611-0042):",
        "• ZKTeco F18 (F18) × 12",
        "• Alpha AL M280 (AL M280) × 12",
        "• Not listed: XYZ-999 × 2",
        "Need: Delivery abroad · Kenya · Mombasa",
        "Timing: Within 2 weeks",
        "Buyer: Distributor abroad · Nairobi Secure Ltd",
        "Name: Amina",
        "Reply by: WhatsApp",
      ].join("\n"),
    );
  });

  it("installation lists the site facts that were given, and nothing else", () => {
    const msg = buildQuoteMessage({
      reference: "Q-2611-0001",
      lines: lines.slice(0, 1),
      products,
      context: { need: "install", emirate: "dubai", siteType: "office", doors: "4" },
      labels,
    });
    expect(msg).toContain("Need: Supply and installation · Dubai · Office · 4 doors");
    expect(msg).not.toContain("Name:");
  });

  it("references look like Q-YYMM-NNNN", () => {
    expect(makeReference(new Date(2026, 10, 21), () => 0.0042)).toBe("Q-2611-0042");
  });
});

describe("store context and undo", () => {
  it("keeps the need with the list and restores a removed line in place", () => {
    let s = quoteReducer(EMPTY_QUOTE, { type: "add", slug: "f18", qty: 1 });
    s = quoteReducer(s, { type: "add", slug: "al-m280", qty: 1 });
    s = quoteReducer(s, { type: "setContext", patch: { need: "export", country: "Kenya" } });
    const removed = s.lines[0];
    s = quoteReducer(s, { type: "remove", key: "f18" });
    s = quoteReducer(s, { type: "restore", line: removed, index: 0 });
    expect(s.lines.map((l) => (l.kind === "product" ? l.slug : l.id))).toEqual(["f18", "al-m280"]);
    expect(s.context).toEqual({ need: "export", country: "Kenya" });
  });

  it("clearing the list also clears the context", () => {
    const s = quoteReducer({ ...EMPTY_QUOTE, context: { need: "supply" } }, { type: "clear" });
    expect(s.context).toBeUndefined();
  });
});

describe("need preset from the URL", () => {
  it("accepts the three needs and ignores anything else", () => {
    expect(needFromSearch("?need=install")).toBe("install");
    expect(needFromSearch("?q=f18&need=export")).toBe("export");
    expect(needFromSearch("?need=INSTALL")).toBeUndefined();
    expect(needFromSearch("?need=")).toBeUndefined();
    expect(needFromSearch("")).toBeUndefined();
  });
});
