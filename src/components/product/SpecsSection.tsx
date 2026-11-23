import Image from "next/image";
import { ContactLink } from "@/components/contact/ContactLink";
import { ArrowIcon } from "@/components/icons";
import { MomentTrigger } from "@/components/ui/MomentTrigger";
import { Section } from "@/components/ui/Section";
import type { SpecHints } from "@/content/glossary";
import type { Product } from "@/content/schema";
import { CONTACT, whatsappUrl } from "@/lib/site";
import type { DataAttrs } from "./englishData";
import { SpecList } from "./SpecList";

type Props = {
  p: Pick<Product, "specs" | "images">;
  heading: string;
  hints: SpecHints;
  /** Shown when AIMS publishes no spec rows: say so, and offer a way to ask (CLAUDE.md 1). */
  empty: { body: string; ask: string; message: string };
  data: DataAttrs;
  ground: "paper" | "band";
  /** The page's dealt moment when it has no "How it connects" diagram: the close-up develops once. */
  moment: boolean;
};

/** Below this width a deep zoom would show the photo's pixels; a small file takes a shallower crop. */
const ZOOM_MIN_WIDTH = 800;

/**
 * Specifications beside a close-up of AIMS's own photograph (taste sections.md, Product: "its parts close
 * up"): the same file, cropped and zoomed into the frame, never a new or invented picture.
 */
export function SpecsSection({ p, heading, hints, empty, data, ground, moment }: Props) {
  const image = p.images[0];
  const zoom = image && image.width >= ZOOM_MIN_WIDTH ? "product-closeup-zoom" : "product-closeup-zoom-soft";
  return (
    <Section ground={ground} labelledBy="specs">
      <h2 id="specs" className="section-title mb-8 lg:mb-10">
        {heading}
      </h2>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        {image && (
          <div className={`product-closeup ${zoom}`} data-moment={moment ? "" : undefined}>
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 30rem, 100vw"
              className="product-closeup-photo"
            />
            {moment && <MomentTrigger />}
          </div>
        )}
        {p.specs.length > 0 ? (
          <SpecList groups={p.specs} hints={hints} data={data} />
        ) : (
          <div className="ui-panel self-start">
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
      </div>
    </Section>
  );
}
