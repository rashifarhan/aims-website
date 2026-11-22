import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { softwareBySlug } from "@/content/catalogue";
import { NavigationLink } from "@/components/shell/NavigationLink";

type Props = {
  heading: string;
  lead: string;
  /** Programs from content/software.json, each with how it runs and what it is for. */
  items: { slug: string; kind: string; body: string }[];
  /** "Open {name}" link label. */
  open: string;
  /** The section's picture: one screen of the subject (an event log, a timesheet), illustrative. */
  panel: { title: string; label: string; rows: { time: string; text: string }[] };
};

/**
 * T3 software that fits (Master Plan 14): the programs as one list of rows beside one picture of
 * the subject as live HTML (data-ui, the skill's UI mock). Software pages are planned routes, so
 * NavigationLink sends them to aimsuae.me, marked as external.
 */
export async function SoftwareSplit({ heading, lead, items, open, panel }: Props) {
  const t = await getDictionary();
  const locale = await getLocale();
  return (
    <section className="section ground-surface g2m" id="software" aria-labelledby="software-h">
      <div className="wrap grid--middle t3-split grid">
        <div className="span-5 stack-5">
          <div className="section-head">
            <h2 id="software-h">{heading}</h2>
            <p className="t-lead">{lead}</p>
          </div>
          <ul className="rows">
            {items.flatMap((item) => {
              const s = softwareBySlug(item.slug);
              if (!s) return [];
              return (
                <li key={item.slug}>
                  <span className="rows__name" dir="ltr">
                    {s.name}
                  </span>
                  <span className="rows__value t-small">{item.kind}</span>
                  <p>
                    {item.body}{" "}
                    <NavigationLink
                      externalLabel={t.home.external}
                      href={localePath(locale, `/software/${item.slug}`)}
                      className="link"
                    >
                      {fmt(open, { name: s.name })}
                    </NavigationLink>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
        <figure className="span-7 event-log start-6" role="img" aria-label={panel.label} data-ui="">
          <div className="event-log__bar" dir="ltr">
            {panel.title}
          </div>
          <ol className="event-log__rows">
            {panel.rows.map((row) => (
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
