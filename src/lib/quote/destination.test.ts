import { expect, test } from "vitest";
import { destinationFromSearch } from "./context";

test("export links validate a supported destination and never overwrite from arbitrary URL text", () => {
  expect(destinationFromSearch("?need=export&country=Kenya")).toEqual({ need: "export", country: "Kenya" });
  expect(destinationFromSearch("?need=export&country=Oman")).toEqual({ need: "export", country: "Oman" });
  expect(destinationFromSearch("?need=install&country=Kenya")).toBeUndefined();
  expect(destinationFromSearch("?need=export&country=unknown")).toBeUndefined();
});
