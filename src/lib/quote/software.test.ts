import { expect, it } from "vitest";
import { EMPTY_QUOTE, quoteReducer } from "./store";

it("keeps a buyer's chosen need and quantity when a platform is requested again", () => {
  const market = quoteReducer(EMPTY_QUOTE, { type: "setContext", patch: { need: "export", country: "Kenya" } });
  const request = { type: "requestSoftware", slug: "biotime-9-5", text: "BioTime 9.5 setup" } as const;
  const saved = quoteReducer(market, request);
  const edited = quoteReducer(saved, { type: "setQty", key: "software-biotime-9-5", qty: 3 });
  const revisited = quoteReducer(edited, request);
  expect(revisited.lines).toEqual([{ kind: "custom", id: "software-biotime-9-5", text: request.text, qty: 3 }]);
  expect(revisited.context).toEqual({ need: "export", country: "Kenya" });
});
