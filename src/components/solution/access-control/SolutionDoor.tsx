import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { DOOR_MODELS, DoorIllustration } from "@/components/home/DoorIllustration";
import { productBySlug, softwareBySlug } from "@/content/catalogue";
import { isBuiltSoftware } from "@/lib/software";

const PARTS = ["reader", "controller", "lock", "exit", "card", "software"] as const;

/** The catalogue page behind each model code in the drawing (the homepage door's products). */
const PART_PATHS: Record<(typeof PARTS)[number], { product?: string; software?: string }> = {
  reader: { product: "kr602" },
  controller: { product: "inbio-pro-160" },
  lock: { product: "al-m280" },
  exit: { product: "alf-b21-exit-button" },
  card: { product: "id-card-thin" },
  software: { software: "zkaccess-3-5" },
};

/** A part links only when its page is built here (CLAUDE.md §6). */
function partPath({ product, software }: { product?: string; software?: string }): string | null {
  if (product) return productBySlug(product) ? `/product/${product}` : null;
  if (software) return softwareBySlug(software) && isBuiltSoftware(software) ? `/software/${software}` : null;
  return null;
}

/**
 * The page's dealt moment, UNLOCK (Design Doc 8.2; approved prototype docs/prototypes/door-kit): when a
 * third of the section is on screen MomentTrigger sets `data-played` and the door assembles, the card
 * taps and the door opens, once (door.css). The parts list is the drawing's text equivalent (Design
 * Doc 14) and links each model code to its page, as the homepage door does.
 */
export async function SolutionDoor({ idPrefix }: { idPrefix: string }) {
  const t = await getDictionary();
  const c = t.solutionAccessControl.door;
  const locale = await getLocale();
  return (
    <section className="t3-section t3-door wrap" data-moment aria-labelledby={`${idPrefix}-door-title`}>
      <div>
        <h2 id={`${idPrefix}-door-title`} className="section-title">
          {c.heading}
        </h2>
        <p className="section-lead">{c.lead}</p>
        <ol className="t3-door-parts" aria-label={c.partsLabel}>
          {PARTS.map((part, i) => {
            const path = partPath(PART_PATHS[part]);
            const label = (
              <span>
                {t.home.door[part]}
                <bdi className="home-door-code">{DOOR_MODELS[part]}</bdi>
              </span>
            );
            return (
              <li key={part}>
                <span className="home-door-index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  {path ? (
                    <Link href={localePath(locale, path)} className="home-door-link">
                      {label}
                    </Link>
                  ) : (
                    label
                  )}
                  <p className="t3-door-note">{c.parts[part]}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="home-door-stage">
        <DoorIllustration labels={t.home.door} />
      </div>
    </section>
  );
}
