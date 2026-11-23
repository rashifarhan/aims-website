import { EditorialBlocks } from "@/components/editorial/EditorialBlocks";
import { Faq } from "@/components/ui/Faq";
import { faqItems, warrantyPage } from "@/content/pages";
import { getDictionary } from "@/i18n/dictionaries";
import { publishableQuestions } from "@/lib/editorial";
import { SupportRoute } from "./SupportRoute";

/** The three parts of /support, with the ids the in-page index and the old URLs' 301s point to. */
export const SUPPORT_SECTIONS = ["warranty", "process", "faq"] as const;

/**
 * Support's reading column (Master Plan 12 #10: warranty terms, support process, FAQ; Design Doc 10.1).
 * The warranty and the answers are AIMS's published text, English on /ar too; the process repeats only
 * what AIMS and ZKTeco publish (after-sales technical support; the warranty's repair terms).
 */
export async function SupportSections() {
  const { support: c } = await getDictionary();
  const questions = publishableQuestions(faqItems());
  return (
    <div className="ed-column co-support">
      <section id="warranty" aria-labelledby="warranty-title">
        <h2 id="warranty-title" className="section-title">
          {c.warrantyHeading}
        </h2>
        <p className="co-support-note">{c.warrantyNote}</p>
        <EditorialBlocks blocks={warrantyPage().blocks} level={3} />
      </section>
      {/* The page's one dealt moment (CLAUDE.md §3): the route draws once this section is in view. */}
      <section id="process" data-moment aria-labelledby="process-title">
        <h2 id="process-title" className="section-title">
          {c.processHeading}
        </h2>
        <div className="co-support-route">
          <SupportRoute channels={[c.route.channels[0], c.route.channels[1]]} team={c.route.team} />
        </div>
        <ol className="co-steps">
          {c.steps.map((step, i) => (
            <li key={step.title}>
              <span className="process-index tabular-nums" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <p className="process-owner">
                  <span className="sr-only">{c.owner}: </span>
                  {step.owner}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section id="faq" aria-labelledby="faq-title">
        <h2 id="faq-title" className="section-title">
          {c.faqHeading}
        </h2>
        <p className="co-support-note">{c.faqNote}</p>
        <Faq
          lang="en"
          dir="ltr"
          items={questions.map((q) => ({ q: q.question, a: <EditorialBlocks blocks={q.answer} level={3} /> }))}
        />
      </section>
    </div>
  );
}
