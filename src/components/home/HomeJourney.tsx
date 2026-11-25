import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ArrowIcon, ChatIcon, DocumentIcon, HeadsetIcon, ToolIcon, TruckIcon } from "@/components/icons";
import { JourneySteps } from "@/components/ui/JourneySteps";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";

/**
 * "How AIMS works": the home preview of the Services menu (client decision, 25 Nov 2026), in the one process design
 * (ui/JourneySteps) on a light ground between the two night bands. Five steps from what AIMS publishes: the channels
 * in src/lib/site.ts, supply and installation from Dubai and Abu Dhabi, delivery to the GCC and Africa, support by
 * WhatsApp or email. No durations, no training. The services page is the header's end link.
 */
export async function HomeJourney() {
  const t = await getDictionary();
  const locale = await getLocale();
  const j = t.home.journey;
  return (
    <Section id="journey" labelledBy="journey-title" className="home-journey">
      <SectionHeader
        id="journey-title"
        title={j.heading}
        lead={j.lead}
        link={
          <Link href={localePath(locale, "/services")} className="home-secondary">
            {j.services}
            <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
          </Link>
        }
      />
      <JourneySteps
        steps={[
          { icon: <ChatIcon />, ...j.tell },
          // The same quotation line as the services process, so the two pages describe step two alike.
          { icon: <DocumentIcon />, title: j.quote.title, body: t.services.process.steps[1].body },
          { icon: <TruckIcon />, ...j.supply },
          { icon: <ToolIcon />, ...j.install },
          { icon: <HeadsetIcon />, ...j.support },
        ]}
      />
    </Section>
  );
}
