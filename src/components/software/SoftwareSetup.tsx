import { ChevronDownIcon } from "@/components/icons";
import type { BuiltSoftware } from "@/lib/software";
import { loadSoftwarePage } from "./softwareCopy";

/**
 * T6 detail, "licences & installation" (Plan 12 #29; Design Doc 11, Download flow). Three steps say
 * how AIMS delivers software today: by request, matched to the version, then installed. The two
 * questions answer the download and compatibility doubts in native disclosures (CLAUDE.md §4).
 */
export async function SoftwareSetup({ slug }: { slug: BuiltSoftware }) {
  const { c } = await loadSoftwarePage(slug);
  return (
    <section className="sw-section sw-screen wrap" aria-labelledby="sw-setup-title">
      <h2 id="sw-setup-title" className="t3-title">
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
      <div className="t3-questions sw-questions">
        <h3 className="sw-questions-title">{c.setup.questions}</h3>
        <div>
          {c.setup.faq.map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <ChevronDownIcon />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
