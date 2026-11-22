import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { DoorIllustration } from "@/components/home/DoorIllustration";
import { productBySlug, softwareBySlug } from "@/content/catalogue";
import { NavigationLink } from "@/components/shell/NavigationLink";
import { DoorKitStage } from "./DoorKitStage";

/** The six parts in the prototype's order, each with the catalogue entry it names. */
const PARTS = [
  { key: "reader", product: "kr602" },
  { key: "controller", product: "inbio-pro-160" },
  { key: "lock", product: "al-m280" },
  { key: "exit", product: "alf-b21-exit-button" },
  { key: "card", product: "id-card-thin" },
  { key: "software", software: "zkaccess-3-5" },
] as const;

/**
 * T3 row 2, the "how it works" explainer (Master Plan 14; Design Doc 8.2): the door kit builds
 * itself as the section scrolls, two screens tall, the drawing held by position: sticky. The steps
 * are the explainer's text equivalent, in the HTML whatever the motion does.
 */
export async function DoorKitStory() {
  const t = await getDictionary();
  const c = t.solutionAccessControl.story;
  const locale = await getLocale();
  return (
    <section className="section door-story" id="how" aria-labelledby="story-h" data-door-story="">
      <div className="wrap t3-split grid">
        <div className="span-5 door-story__text">
          <h2 id="story-h">{c.heading}</h2>
          <ol className="door-story__steps">
            {PARTS.map((part, i) => {
              const product = "product" in part ? productBySlug(part.product) : undefined;
              const software = "software" in part ? softwareBySlug(part.software) : undefined;
              const target = product
                ? { href: localePath(locale, `/product/${product.slug}`), label: product.model }
                : software && { href: localePath(locale, `/software/${software.slug}`), label: software.name };
              return (
                <li key={part.key} data-story-step="">
                  <span className="door-story__num mono" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {/* The heading names the part and its model, linked (skill copy.md: a noun in every heading). */}
                  <h3>
                    {part.key === "card" ? c.cardTitle : t.home.door[part.key]}{" "}
                    {target && (
                      // Software pages are planned routes: NavigationLink sends them to aimsuae.me, marked.
                      <NavigationLink
                        externalLabel={t.home.external}
                        href={target.href}
                        className="link mono door-story__model"
                        dir="ltr"
                      >
                        {target.label}
                      </NavigationLink>
                    )}
                  </h3>
                  <p>{c.steps[part.key]}</p>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="span-7 door-story__hold">
          <DoorKitStage>
            <DoorIllustration labels={t.home.door} pulse />
          </DoorKitStage>
        </div>
      </div>
    </section>
  );
}
