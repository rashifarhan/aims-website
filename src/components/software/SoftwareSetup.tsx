import { Faq } from "@/components/ui/Faq";
import type { BuiltSoftware } from "@/lib/software";
import { loadSoftwarePage } from "./softwareCopy";
import { Section } from "@/components/ui/Section";

/**
 * T6 detail, "licences & installation" (Plan 12 #29; Design Doc 11, Download flow). Three steps say
 * how AIMS delivers software today: by request, matched to the version, then installed. The two
 * questions answer the download and compatibility doubts in native disclosures (CLAUDE.md §4).
 */
export async function SoftwareSetup({ slug }: { slug: BuiltSoftware }) {
  const { c } = await loadSoftwarePage(slug);
  return (
    <Section labelledBy="sw-setup-title" className="sw-screen">
      <h2 id="sw-setup-title" className="section-title">
        {c.setup.heading}
      </h2>
      <ol className="sw-steps">
        {c.setup.steps.map((step, i) => (
          <li key={step.title}>
            <span className="process-index tabular-nums" aria-hidden="true">
              {i + 1}
            </span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
      <Faq items={c.setup.faq} intro={<h3 className="sw-questions-title">{c.setup.questions}</h3>} />
    </Section>
  );
}
