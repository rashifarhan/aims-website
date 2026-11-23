/**
 * Splits an imported model field into the code and the description AIMS wrote after it.
 *
 * 41 products carry a description in `model` ("LH4000 Smart Hotel Door Lock", "TS1022 Pro Tripod Turnstile
 * w/ controller…"). A card sets the code as its mono heading (Design Doc 9: "model (mono)", DESIGN.md "The
 * Datasheet Rule"), so the description moves to the line under it and no word is lost (CLAUDE.md §1).
 *
 * The description starts at the first capitalised word of four or more letters that follows a token with a
 * digit. Series words stay part of the code ("TS2000 Pro Series"). A field with no digit before such a word
 * ("Barrier Gates BGM 1045", "Door Contact") is all code.
 */
const DESCRIPTIVE = /^[A-Z][a-z]{3,}(?:-[A-Za-z]+)?$/;
const CODE_WORDS = new Set(["Series", "Lite", "Plus", "Mini"]);

export function splitModel(model: string): { code: string; description: string } {
  const words = model.trim().split(/\s+/);
  let seenDigit = false;
  for (const [i, word] of words.entries()) {
    if (seenDigit && i > 0 && DESCRIPTIVE.test(word) && !CODE_WORDS.has(word)) {
      return { code: words.slice(0, i).join(" "), description: words.slice(i).join(" ") };
    }
    if (/\d/.test(word)) seenDigit = true;
  }
  return { code: model.trim(), description: "" };
}
