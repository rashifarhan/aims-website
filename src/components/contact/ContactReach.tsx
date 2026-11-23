import { ReachMap } from "@/components/home/ReachMap";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = { t: Dictionary["contactPage"]; labels: Dictionary["home"]["reach"] };

/**
 * SIGNAL on /contact: the homepage's reach map on night green, its routes drawing once from Dubai when
 * the band enters view (MomentTrigger; src/components/signature/reach.css). The page's one dealt
 * moment. The lead repeats what AIMS publishes about where it supplies and ships, nothing more.
 */
export function ContactReach({ t, labels }: Props) {
  return (
    <section aria-labelledby="contact-reach-title" className="contact-reach reach-moment" data-moment>
      <div className="contact-reach-grid wrap">
        <div>
          <h2 id="contact-reach-title" className="text-2xl font-bold tracking-tight text-night-text sm:text-3xl">
            {t.reachTitle}
          </h2>
          <p className="mt-3 max-w-md text-base text-night-muted sm:text-lg">{t.reachLead}</p>
        </div>
        <div className="contact-reach-map">
          <ReachMap labels={labels} />
        </div>
      </div>
    </section>
  );
}
