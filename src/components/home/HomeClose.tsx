import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon } from "@/components/icons";
import { FloodPieces } from "@/components/families/FloodPieces";
import { GiantWord } from "@/components/families/GiantWord";
import { QUOTE_BITS, QUOTE_WORD } from "@/components/families/familyShowcase";

/** The closing flood: the giant QUOTE over the access ground with real pieces floating, and the one call to act. */
export async function HomeClose() {
  const t = await getDictionary();
  const locale = await getLocale();
  const c = t.home.closing;
  return (
    <section className="hc flood" aria-labelledby="closing-title">
      <div className="hc-frame">
        <div className="fam-layer" data-layer="word">
          <GiantWord word={QUOTE_WORD.word} em={QUOTE_WORD.wordEm} className="hc-word" />
        </div>
        <FloodPieces bits={QUOTE_BITS} layer="bits" />
      </div>
      <div className="hc-copy">
        <h2 id="closing-title" className="hc-title" data-heading-reveal>
          {c.heading}
        </h2>
        <p className="hc-body">{c.body}</p>
        <div className="hc-actions">
          <Link href={localePath(locale, "/quote")} className="home-button">
            {c.action}
            <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />
          </Link>
          <Link href={localePath(locale, "/products")} className="flood-link">
            {c.secondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
