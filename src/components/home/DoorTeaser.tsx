import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon } from "@/components/icons";
import { DOOR_MODELS, DoorIllustration } from "./DoorIllustration";
import { reveal } from "./reveal";

const PARTS = ["reader", "controller", "lock", "exit", "card", "software"] as const;

/** T1 row 4; the parts list is the drawing's text equivalent (Design Doc 14). */
export async function DoorTeaser() {
  const {
    home: { door },
  } = await getDictionary();
  const locale = await getLocale();
  return (
    <section className="home-section home-door page-container" data-scene aria-labelledby="door-title">
      <div {...reveal()}>
        <h2 id="door-title" className="home-section-title">
          {door.heading}
        </h2>
        <p className="home-section-lead">{door.body}</p>
        <ol className="home-door-parts" aria-label={door.partsLabel}>
          {PARTS.map((part, i) => (
            <li key={part}>
              <span className="home-door-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                {door[part]}
                <bdi className="home-door-code">{DOOR_MODELS[part]}</bdi>
              </span>
            </li>
          ))}
        </ol>
        <Link href={localePath(locale, "/products/access-control")} className="home-text-link home-text-link-row">
          {door.action}
          <ArrowIcon width="16" height="16" className="home-action-arrow" />
        </Link>
      </div>
      <div className="home-door-stage">
        <DoorIllustration labels={door} />
      </div>
    </section>
  );
}
