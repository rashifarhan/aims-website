import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { journeySteps } from "./journeySteps";
import { JourneyTicketMotion } from "./JourneyTicketMotion";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * How AIMS works (direction 2, stage): the job ticket, the page's second pinned sequence. As the page scrolls, each of
 * the five steps is punched in turn and its detail stands beside the ticket (JourneyTicketMotion). The ticket repeats
 * the list, so it is hidden from screen readers; the list of steps is the content. Without JavaScript or under reduced
 * motion the steps simply follow one another.
 */
export async function InsideJourney() {
  const t = await getDictionary();
  const locale = await getLocale();
  const j = t.home.journey;
  const i = t.home.inside;
  const steps = journeySteps(t, locale);
  return (
    <section id="journey" className="hj in-stage" aria-labelledby="journey-title">
      <div className="hj-pin">
        <div className="hj-grid">
          <div className="hj-head">
            <p className="in-eyebrow">{i.journeyEyebrow}</p>
            <h2 id="journey-title" className="in-h2">
              {j.heading}
            </h2>
            <p className="in-lead">{j.lead}</p>
            <Link href={localePath(locale, "/services")} className="in-link">
              {j.services}
            </Link>
            <p className="hj-count" aria-hidden="true" dir="ltr">
              <span className="hj-count-now">{pad(1)}</span>
              <span className="hj-count-total"> / {pad(steps.length)}</span>
            </p>
          </div>
          <div className="hj-ticket in-ticket" aria-hidden="true">
            <p className="hj-ticket-head in-mono">
              <span>{i.ticket}</span>
              <span>{i.ticketPlace}</span>
            </p>
            {steps.map((step, k) => (
              <div key={step.title} className="hj-row" data-state={k === 0 ? "now" : "next"}>
                <i className="hj-hole" />
                <b>{step.title}</b>
                <span className="hj-state in-mono">
                  <span className="hj-done">{i.done}</span>
                  <span className="hj-now">{i.now}</span>
                  <span className="hj-next">{pad(k + 1)}</span>
                </span>
              </div>
            ))}
          </div>
          <ol className="hj-steps">
            {steps.map((step, k) => (
              <li key={step.title} className="hj-step" data-active={k === 0 || undefined}>
                <h3>
                  <span className="hj-step-number in-mono" aria-hidden="true">
                    {pad(k + 1)}
                  </span>
                  {step.title}
                </h3>
                <p>{step.body}</p>
                <p className="hj-who in-mono">
                  {t.services.process.owner}: {step.who}
                </p>
                <ul>
                  {step.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {step.link && (
                  <Link href={step.link.href} className="in-link">
                    {step.link.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <JourneyTicketMotion sectionId="journey" />
    </section>
  );
}
