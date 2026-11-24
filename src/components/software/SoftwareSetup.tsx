import { Faq } from "@/components/ui/Faq";
import { DocumentIcon, KeyIcon, SlidersIcon } from "@/components/icons";
import { JourneySteps } from "@/components/ui/JourneySteps";
import type { BuiltSoftware } from "@/lib/software";
import { loadSoftwarePage } from "./softwareCopy";
import { Section } from "@/components/ui/Section";

/** Add it to the quote, licences confirmed, installed and configured. */
const ICONS = [<DocumentIcon key="quote" />, <KeyIcon key="licence" />, <SlidersIcon key="setup" />];

/**
 * T6 detail, "licences & installation" (Plan 12 #29; Design Doc 11, Download flow). Three steps, in the one
 * process design (ui/JourneySteps), say how AIMS delivers software today: by request, matched to the version, then
 * installed. The two questions answer the download and compatibility doubts in native disclosures (CLAUDE.md §4).
 */
export async function SoftwareSetup({ slug }: { slug: BuiltSoftware }) {
  const { c } = await loadSoftwarePage(slug);
  return (
    <Section labelledBy="sw-setup-title" className="sw-setup">
      <JourneySteps
        heading={{ id: "sw-setup-title", title: c.setup.heading }}
        steps={c.setup.steps.map((step, i) => ({ ...step, icon: ICONS[i] }))}
      />
      <Faq items={c.setup.faq} intro={<h3 className="sw-questions-title">{c.setup.questions}</h3>} />
    </Section>
  );
}
