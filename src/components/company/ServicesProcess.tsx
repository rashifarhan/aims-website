import { VerifyMark } from "@/components/quote/VerifyMark";
import { getDictionary } from "@/i18n/dictionaries";
import { ChatIcon, DocumentIcon, HeadsetIcon, ToolIcon } from "@/components/icons";
import { JourneySteps } from "@/components/ui/JourneySteps";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Section } from "@/components/ui/Section";

/** Brief, plan and quotation, installation, handover and support. */
const ICONS = [
  <ChatIcon key="brief" />,
  <DocumentIcon key="quote" />,
  <ToolIcon key="install" />,
  <HeadsetIcon key="support" />,
];

/**
 * Master Plan 12 #5 "process with owners", in the one process design (ui/JourneySteps), and the page's one dealt
 * moment, VERIFY (Design Doc 8: signal lines converge into ✓): when a third of the band is on screen,
 * MomentTrigger sets `data-played` and the three inputs of a job (site details, plan and quotation, installation)
 * draw into the handover check, once (signature/verify-moment.css). The mark is decorative; the steps say the same
 * in text. No durations: AIMS publishes none.
 */
export async function ServicesProcess() {
  const { services } = await getDictionary();
  const c = services.process;
  return (
    <Section ground="band" labelledBy="services-process-title" className="co-process" moment>
      <div className="co-process-head">
        <SectionHeader id="services-process-title" title={c.heading} lead={c.lead} />
        <div className="verify-moment co-process-mark">
          <VerifyMark labels={[c.verify[0], c.verify[1], c.verify[2]]} />
        </div>
      </div>
      <JourneySteps ownerLabel={c.owner} steps={c.steps.map((step, i) => ({ ...step, icon: ICONS[i] }))} />
    </Section>
  );
}
