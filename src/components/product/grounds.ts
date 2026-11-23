export type Ground = "paper" | "band";

export type ProductGrounds = { fitted: Ground; specs: Ground; details: Ground };

/**
 * Grounds for the sections under the T5 hero (taste House rules: ground alternation gives the page its
 * rhythm). The hero stands on paper; "How it connects", when the product lists enough to draw, is night
 * green; every other section takes the opposite of the one above it, whichever sections the product's
 * data leaves out. The close is always the mint panel, which stands apart on either ground (and keeps the
 * add-to-quote control's green on a light surface, Design Doc 4).
 */
export function productGrounds({ connects, fitted }: { connects: boolean; fitted: boolean }): ProductGrounds {
  // After the paper hero, or after night green, the next light section is a band.
  let prev: Ground | "night" = connects ? "night" : "paper";
  const next = (): Ground => {
    const g: Ground = prev === "band" ? "paper" : "band";
    prev = g;
    return g;
  };
  const fittedGround = fitted ? next() : "paper";
  const specs = next();
  const details = next();
  return { fitted: fittedGround, specs, details };
}
