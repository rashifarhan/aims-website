import type { ReactNode } from "react";
import type { ProcessCopy } from "./types";
import { ChatIcon, DocumentIcon, HeadsetIcon, SlidersIcon, ToolIcon } from "@/components/icons";
import { JourneySteps } from "@/components/ui/JourneySteps";
import { Section } from "@/components/ui/Section";

/** Brief, plan and quote, installation, setup, support: the five steps every solution page shares. */
const ICONS: readonly ReactNode[] = [
  <ChatIcon key="brief" />,
  <DocumentIcon key="quote" />,
  <ToolIcon key="install" />,
  <SlidersIcon key="setup" />,
  <HeadsetIcon key="support" />,
];

/**
 * T3 row 5: installation and support process with owners (Plan 14), in the one process design (ui/JourneySteps).
 * No durations: AIMS hasn't published any. `icons` replaces the shared set where a page's steps differ (POS
 * delivers its terminals rather than installing them).
 */
export function SolutionProcess({
  idPrefix,
  copy,
  icons = ICONS,
}: {
  idPrefix: string;
  copy: ProcessCopy;
  icons?: readonly ReactNode[];
}) {
  return (
    <Section labelledBy={`${idPrefix}-process-title`}>
      <JourneySteps
        heading={{ id: `${idPrefix}-process-title`, title: copy.heading, lead: copy.lead }}
        ownerLabel={copy.owner}
        steps={copy.steps.map((step, i) => ({ ...step, icon: icons[i] }))}
      />
    </Section>
  );
}
