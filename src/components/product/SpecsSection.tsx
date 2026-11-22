import { ContactLink } from "@/components/contact/ContactLink";
import { ArrowIcon } from "@/components/icons";
import type { SpecHints } from "@/content/glossary";
import type { Product } from "@/content/schema";
import { CONTACT, whatsappUrl } from "@/lib/site";
import type { DataAttrs } from "./englishData";
import { SpecTable } from "./SpecTable";

type Props = {
  p: Pick<Product, "specs">;
  heading: string;
  hints: SpecHints;
  /** Shown when AIMS publishes no spec rows: say so, and offer a way to ask (CLAUDE.md 1). */
  empty: { body: string; ask: string; message: string };
  sectionClass: string;
  data: DataAttrs;
};

export function SpecsSection({ p, heading, hints, empty, sectionClass, data }: Props) {
  return (
    <section aria-labelledby="specs" className={sectionClass}>
      <h2 id="specs" className="text-2xl font-bold tracking-tight">
        {heading}
      </h2>
      {p.specs.length > 0 ? (
        <SpecTable groups={p.specs} hints={hints} data={data} />
      ) : (
        <div className="rounded-md bg-paper-2 p-5">
          <p className="text-ink-700">{empty.body}</p>
          <ContactLink
            kind="whatsapp"
            href={whatsappUrl(empty.message)}
            target={CONTACT.lines.mobile.display}
            message={empty.message}
            className="home-text-link"
          >
            {empty.ask}
            <ArrowIcon width={16} height={16} className="home-action-arrow rtl:-scale-x-100" />
          </ContactLink>
        </div>
      )}
    </section>
  );
}
