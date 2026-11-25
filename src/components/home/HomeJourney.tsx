import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { fmt } from "@/i18n/format";
import { productCount } from "@/content/catalogue";
import { ArrowIcon, ChatIcon, DocumentIcon, HeadsetIcon, ToolIcon, TruckIcon } from "@/components/icons";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { JourneyCard, type JourneyCardStep } from "./JourneyCard";
import { JourneyCounter } from "./JourneyCounter";
import { JourneyMotion } from "./JourneyMotion";
import "./home-journey.css";

/**
 * "How AIMS works": the home preview of the Services menu (client decision, 25 Nov 2026) as a scroll timeline (client
 * request and GSAP approval, 25 Nov 2026; README Decisions "Home journey timeline"). From 1024px the heading, lead, end
 * link and a step counter take the start five columns and five step cards stand on a rail in the end seven; below, one
 * column with the rail on the start edge. On a light ground between the two night bands.
 *
 * The server renders the final frame. JourneyMotion, the one client leaf, lazy-loads GSAP and pins and scrubs it
 * (journeyMotion.ts). GSAP drives the whole section, so it opts out of the CSS scroll reveal (`moment`: ui/reveal.css
 * leaves a moment's blocks alone) and the title is passed as a node, so HeadingReveal leaves it to the journey's own SplitText.
 *
 * Every line is AIMS's own published copy (CLAUDE.md §1): owners from the services process, the quotation line from
 * services step two, devices and setup merged from the access control and time attendance processes, coverage and
 * warranty from the services cover cards, the model count from the catalogue (as the families header reads it). No
 * durations, no training: AIMS publishes none.
 */
export async function HomeJourney() {
  const t = await getDictionary();
  const locale = await getLocale();
  const j = t.home.journey;
  const owners = t.services.process.steps;
  const steps: JourneyCardStep[] = [
    {
      icon: <ChatIcon />,
      title: j.tell.title,
      body: j.tell.body,
      who: owners[0].owner,
      points: [owners[0].body, j.tell.channels],
      link: { href: localePath(locale, "/quote"), label: t.home.hero.quote },
    },
    {
      icon: <DocumentIcon />,
      title: j.quote.title,
      // The same quotation line as the services process, so the two pages describe step two alike.
      body: owners[1].body,
      who: owners[1].owner,
      points: [j.quote.attendance, j.quote.doors],
    },
    {
      icon: <TruckIcon />,
      title: j.supply.title,
      body: j.supply.body,
      who: owners[1].owner,
      points: [fmt(t.home.families.heading, { count: productCount() }), j.supply.export],
    },
    {
      icon: <ToolIcon />,
      title: j.install.title,
      body: j.install.body,
      who: owners[2].owner,
      points: [j.install.devices, j.install.setup],
    },
    {
      icon: <HeadsetIcon />,
      title: j.support.title,
      body: j.support.body,
      who: owners[3].owner,
      points: [j.support.warranty, j.support.changes],
      link: { href: localePath(locale, "/support"), label: t.services.cover.warrantyAction },
    },
  ];
  return (
    <Section id="journey" labelledBy="journey-title" className="home-journey" moment>
      <div className="hj-grid">
        <div className="hj-head">
          <SectionHeader
            id="journey-title"
            title={<>{j.heading}</>}
            lead={j.lead}
            link={
              <Link href={localePath(locale, "/services")} className="home-secondary">
                {j.services}
                <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
              </Link>
            }
          />
          <JourneyCounter total={steps.length} label={j.counter} />
        </div>
        <div className="hj-track">
          <ol className="hj-list">
            {steps.map((step, i) => (
              <JourneyCard
                key={step.title}
                step={step}
                index={i}
                last={i === steps.length - 1}
                labels={{ who: t.services.process.owner, includes: j.includes }}
              />
            ))}
          </ol>
        </div>
      </div>
      <JourneyMotion />
    </Section>
  );
}
