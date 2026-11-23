import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon } from "@/components/icons";
import { DOOR_MODELS, DoorIllustration } from "./DoorIllustration";
import { productBySlug } from "@/content/catalogue";
import { DoorStory } from "@/components/motion/DoorStory";

const PARTS = ["reader", "controller", "lock", "exit", "card", "software"] as const;

/** The product page behind each part's model code. */
const PART_PRODUCTS: Partial<Record<(typeof PARTS)[number], string>> = {
  reader: "kr602",
  controller: "inbio-pro-160",
  lock: "al-m280",
  exit: "alf-b21-exit-button",
  card: "id-card-thin",
};

/**
 * T1 row 4 and the page's UNLOCK moment: native scroll assembles the approved door kit.
 * The parts list is the drawing's text equivalent (Design Doc 14) and links each model code to its
 * product page, so a trade buyer never retypes it (PRODUCT.md, "Model-code first").
 */
export async function DoorTeaser() {
  const {
    home: { door },
  } = await getDictionary();
  const locale = await getLocale();
  return (
    <DoorStory className="home-section home-door page-container" labelledBy="door-title">
      <div>
        <h2 id="door-title" className="home-section-title">
          {door.heading}
        </h2>
        <p className="home-section-lead">{door.body}</p>
        <ol className="home-door-parts" aria-label={door.partsLabel}>
          {PARTS.map((part, i) => {
            const slug = PART_PRODUCTS[part];
            const label = (
              <span>
                {door[part]}
                <bdi className="home-door-code">{DOOR_MODELS[part]}</bdi>
              </span>
            );
            return (
              <li key={part} data-door-step={i + 1}>
                <span className="home-door-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {slug && productBySlug(slug) ? (
                  <Link href={localePath(locale, `/product/${slug}`)} className="home-door-link">
                    {label}
                  </Link>
                ) : (
                  label
                )}
              </li>
            );
          })}
        </ol>
        <Link href={localePath(locale, "/products/access-control")} className="home-text-link home-text-link-row">
          {door.action}
          <ArrowIcon width="16" height="16" className="home-action-arrow" />
        </Link>
      </div>
      <div className="home-door-stage">
        <DoorIllustration labels={door} />
      </div>
    </DoorStory>
  );
}
