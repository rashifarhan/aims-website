import { describe, expect, it } from "vitest";
import {
  bulletsToBlocks,
  canonicalLabel,
  deriveBrand,
  deriveFacets,
  deriveModel,
  displayName,
  excerpt,
  isSlugVariant,
  normaliseSpecs,
  stripBoilerplate,
} from "./normalise";

describe("spec labels", () => {
  it("maps AIMS spelling variants to one label", () => {
    expect(canonicalLabel("Dimension(WxDxH)")).toBe("Dimensions (W × D × H)");
    expect(canonicalLabel("Net weight(kg)")).toBe("Weight");
    expect(canonicalLabel("Number of Doors Controlled")).toBe("Doors controlled");
    expect(canonicalLabel("Numbers of readers supported")).toBe("Readers supported");
    expect(canonicalLabel("Boom Type:")).toBe("Boom type");
  });

  it("keeps acronyms when sentence-casing", () => {
    expect(canonicalLabel("LED Indicator")).toBe("LED indicator");
    expect(canonicalLabel("ID Card Capacity")).toBe("ID card capacity");
  });
});

describe("normaliseSpecs", () => {
  it("drops furniture rows, table header rows, blanks and repeated labels", () => {
    const groups = normaliseSpecs([
      {
        title: "General",
        rows: [
          ["Feature", "Specification"],
          ["Brand", "ZKTeco"],
          ["Weight", "1 kg"],
          ["Net weight", "2 kg"],
          ["Display", "  "],
          ["Display", "2.4-inch TFT"],
        ],
      },
    ]);
    expect(groups).toEqual([
      {
        title: "General",
        rows: [
          { label: "Weight", value: "1 kg" },
          { label: "Display", value: "2.4-inch TFT" },
        ],
      },
    ]);
  });
});

describe("facets", () => {
  it("derives methods and connectivity from name and specs", () => {
    const f = deriveFacets("SpeedFace-V5L [QR]", [
      {
        title: "General",
        rows: [
          { label: "Face capacity", value: "6,000" },
          { label: "Fingerprint capacity", value: "6,000" },
          { label: "Card capacity", value: "10,000" },
          { label: "Communication", value: "TCP/IP, Wi-Fi (optional), RS485, Wiegand in/out" },
        ],
      },
    ]);
    expect(f.methods).toEqual(["face", "fingerprint", "card", "qr"]);
    expect(f.connectivity).toEqual(["tcp-ip", "wifi", "rs485", "wiegand"]);
    expect(f.outdoor).toBe(false);
  });

  it("flags outdoor devices by IP rating", () => {
    expect(deriveFacets("KR601", [{ title: "", rows: [{ label: "Enclosure", value: "IP65" }] }]).outdoor).toBe(true);
  });
});

describe("identity", () => {
  it("separates brand, model and display name", () => {
    expect(deriveBrand("AL-M280", ["alpha"])).toBe("alpha");
    expect(deriveBrand("F18", ["time-attendance"])).toBe("zkteco");
    expect(deriveModel("ZKTeco SpeedFace-V5L [QR]")).toBe("SpeedFace-V5L [QR]");
    expect(displayName("F18", "zkteco")).toBe("ZKTeco F18");
    expect(displayName("ZKTeco F18", "zkteco")).toBe("ZKTeco F18");
    expect(displayName("AL-M280", "alpha")).toBe("Alpha AL-M280");
    expect(displayName("Barrier Gates ZKTeco BGM 1030", "zkteco")).toBe("ZKTeco Barrier Gates BGM 1030");
    expect(deriveModel("ALF B21 - Exit Button")).toBe("ALF B21");
    expect(deriveModel("ZKTeco Inbio Pro 460 - Package B")).toBe("Inbio Pro 460 Package B");
  });

  it("recognises slug variants of the same product", () => {
    expect(isSlugVariant("f18-1", "f18")).toBe(true);
    expect(isSlugVariant("biopro-sa20", "bio-pro-sa20")).toBe(true);
    expect(isSlugVariant("zkbio810", "zkaio1000")).toBe(false);
  });
});

describe("copy", () => {
  it("removes the repeated sales sentence", () => {
    expect(stripBoilerplate("Works on TCP/IP. Like ZKTeco F18, you can buy an access control system from AIMS.")).toBe(
      "Works on TCP/IP.",
    );
  });

  it("turns bullet runs into a list", () => {
    expect(bulletsToBlocks("• one • two")).toEqual([{ type: "ul", items: ["one", "two"] }]);
    expect(bulletsToBlocks("Plain text.")).toEqual([{ type: "p", text: "Plain text." }]);
  });

  it("cuts excerpts at a word boundary", () => {
    expect(excerpt("alpha beta gamma delta", 12)).toBe("alpha beta…");
  });
});
