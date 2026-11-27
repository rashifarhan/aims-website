import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { FloodHead } from "@/components/families/FloodHead";
import { FloodSection } from "@/components/families/FloodSection";

/** How AIMS works, the five steps, on the time ground (Services menu). */
export async function HomeJourney() {
  const t = await getDictionary();
  const locale = await getLocale();
  const j = t.home.journey;
  const steps = [
    { title: j.tell.title, body: j.tell.body },
    { title: j.quote.title, body: `${j.quote.attendance} ${j.quote.doors}` },
    { title: j.supply.title, body: j.supply.body },
    { title: j.install.title, body: j.install.body },
    { title: j.support.title, body: j.support.body },
  ];
  return (
    <FloodSection id="journey" tone="time" labelledBy="journey-title">
      <FloodHead
        id="journey-title"
        kicker={t.nav.services}
        title={j.heading}
        lead={j.lead}
        link={{ href: localePath(locale, "/services"), label: j.services }}
      />
      <ol className="hj-steps">
        {steps.map((s, i) => (
          <li key={s.title}>
            <span className="hj-number" dir="ltr" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </FloodSection>
  );
}
