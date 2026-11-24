import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { ChatIcon, DocumentIcon, HeadsetIcon, ToolIcon, TruckIcon } from "@/components/icons";
import { JourneySteps } from "@/components/ui/JourneySteps";
import { Section } from "@/components/ui/Section";

/**
 * T1 row 8, after the showroom reach (client mockup C, "From the first call to a working system"; README Decisions,
 * 24 Nov 2026). Five steps from what AIMS publishes: the channels in src/lib/site.ts, supply and installation from
 * Dubai and Abu Dhabi, delivery to the GCC and Africa, support by WhatsApp or email. No durations, no training.
 */
export async function HomeJourney() {
  const t = await getDictionary();
  const locale = await getLocale();
  const j = t.home.journey;
  return (
    <Section id="journey" labelledBy="journey-title" className="home-journey">
      <JourneySteps
        heading={{ id: "journey-title", title: j.heading, lead: j.lead }}
        steps={[
          { icon: <ChatIcon />, ...j.tell },
          // The same quotation line as the services process, so the two pages describe step two alike.
          { icon: <DocumentIcon />, title: j.quote.title, body: t.services.process.steps[1].body },
          { icon: <TruckIcon />, ...j.supply },
          { icon: <ToolIcon />, ...j.install },
          { icon: <HeadsetIcon />, ...j.support },
        ]}
        pill={{ text: j.pill, href: localePath(locale, "/quote"), label: t.quote.describeSite }}
      />
    </Section>
  );
}
