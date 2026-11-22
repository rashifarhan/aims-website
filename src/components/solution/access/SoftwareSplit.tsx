import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { softwareBySlug } from "@/content/catalogue";
import { NavigationLink } from "@/components/shell/NavigationLink";

const SOFTWARE = ["zkaccess-3-5", "zkbio-cvaccess", "zkbio-cvsecurity"] as const;

/**
 * T3 row 7, software that fits (Master Plan 14): ZKTeco's access programs as one list of rows,
 * beside one picture of the subject, the door event log (as on the prototype's screen). Software
 * pages are planned routes, so NavigationLink sends them to aimsuae.me, marked as external.
 */
export async function SoftwareSplit() {
  const t = await getDictionary();
  const c = t.solutionAccessControl.software;
  const locale = await getLocale();
  return (
    <section className="section ground-surface g2m" id="software" aria-labelledby="software-h">
      <div className="wrap grid--middle t3-split grid">
        <div className="span-5 stack-5">
          <div className="section-head">
            <h2 id="software-h">{c.heading}</h2>
            <p className="t-lead">{c.lead}</p>
          </div>
          <ul className="rows">
            {SOFTWARE.flatMap((slug) => {
              const s = softwareBySlug(slug);
              if (!s) return [];
              return (
                <li key={slug}>
                  <span className="rows__name" dir="ltr">
                    {s.name}
                  </span>
                  <span className="rows__value t-small">{c.items[slug].kind}</span>
                  <p>
                    {c.items[slug].body}{" "}
                    <NavigationLink
                      externalLabel={t.home.external}
                      href={localePath(locale, `/software/${slug}`)}
                      className="link"
                    >
                      {fmt(c.open, { name: s.name })}
                    </NavigationLink>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
        <figure className="span-7 event-log start-6" role="img" aria-label={c.logLabel} data-ui="">
          <div className="event-log__bar" dir="ltr">
            ZKAccess 3.5 · {c.events}
          </div>
          <ol className="event-log__rows">
            {c.log.map((row) => (
              <li key={row.time + row.text}>
                <span className="mono tabular-nums" dir="ltr">
                  {row.time}
                </span>
                <span>{row.text}</span>
                <span className="event-log__ok" aria-hidden="true">
                  ✓
                </span>
              </li>
            ))}
          </ol>
        </figure>
      </div>
    </section>
  );
}
