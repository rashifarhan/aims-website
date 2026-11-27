import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { DOOR_MODELS } from "@/components/home/DoorIllustration";
import { productBySlug, softwareBySlug } from "@/content/catalogue";
import { isBuiltSoftware } from "@/lib/software";

/** The parts in the order a door works (doorMotionCore.ts): the card is tapped at the reader, the controller checks it
 * and the software records it, the lock releases, and the exit button lets people out. */
const PARTS = ["card", "reader", "controller", "software", "lock", "exit"] as const;

/** The catalogue page behind each model code in the drawing (the homepage door's products). */
const PART_PATHS: Record<(typeof PARTS)[number], { product?: string; software?: string }> = {
  reader: { product: "kr602" },
  controller: { product: "inbio-pro-160" },
  lock: { product: "al-m280" },
  exit: { product: "alf-b21-exit-button" },
  card: { product: "id-card-thin" },
  software: { software: "zkbio-cvaccess" },
};

/** A part links only when its page is built here (CLAUDE.md §6). */
function partPath({ product, software }: { product?: string; software?: string }): string | null {
  if (product) return productBySlug(product) ? `/product/${product}` : null;
  if (software) return softwareBySlug(software) && isBuiltSoftware(software) ? `/software/${software}` : null;
  return null;
}

/** The drawing's text equivalent (Design Doc 14): each part, its model linked to its page, and what it does. */
export async function DoorParts() {
  const t = await getDictionary();
  const c = t.solutionAccessControl.door;
  const locale = await getLocale();
  return (
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
          <li key={part} data-door-step={i + 1}>
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
  );
}
