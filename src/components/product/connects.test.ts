import { describe, expect, it } from "vitest";
import { productBySlug } from "@/content/catalogue";
import { connections, nodeCount } from "./connects";

const spec = (label: string, value: string) => [{ title: "", rows: [{ label, value }] }];

describe("connections", () => {
  it("takes links from connectivity[] and door items verbatim from the interface row", () => {
    const c = connections({
      connectivity: ["tcp-ip", "usb"],
      specs: spec("Access control interface", "3rd Party Electric Lock, Door Sensor ,Exit Button,"),
    });
    expect(c).toEqual({ links: ["tcp-ip", "usb"], door: ["3rd Party Electric Lock", "Door Sensor", "Exit Button"] });
    expect(nodeCount(c)).toBe(5);
  });

  it("infers nothing when the product lists nothing", () => {
    const c = connections({ connectivity: [], specs: spec("Communication", "TCP/IP, RS485") });
    expect(nodeCount(c)).toBe(0);
  });

  it("matches the F18 catalogue record", () => {
    const f18 = productBySlug("f18");
    expect(f18).toBeDefined();
    if (!f18) return;
    const c = connections(f18);
    expect(c.links).toEqual(f18.connectivity);
    expect(c.door).toContain("Exit Button");
  });
});
