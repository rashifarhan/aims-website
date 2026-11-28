import Link from "next/link";
import { ContactLink } from "@/components/contact/ContactLink";
import { StagePill } from "@/components/inside/StagePill";
import { Ticket, type TicketRow } from "@/components/inside/Ticket";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { LOCATION_PAGES, type LocationMarket } from "@/lib/locationPages";
import { CONTACT, LOCATIONS } from "@/lib/site";

/**
 * The panel after a location page's stage (direction 2): the place on a ticket, every value from site.ts
 * or the page's own copy (CLAUDE.md, Truth). Dubai is the showroom to visit; Oman and Kenya are supplied from the
 * Deira head office, and no office there is claimed (lib/locationPages). Then the quote and shortcuts down the page.
 */
export async function LocationInside({ market, faqId }: { market: LocationMarket; faqId: string }) {
  const t = await getDictionary();
  const locale = await getLocale();
  const s = t.locationsStage;
  const c = t.locations[market];
  const common = t.locations.common;
  const page = LOCATION_PAGES[market];
  const dubai = market === "dubai";
  const line = CONTACT.lines[dubai ? "showroom" : "headOffice"];
  const headOffice = LOCATIONS.find((l) => l.id === "headOffice");

  const call: TicketRow = {
    label: common.call,
    value: (
      <ContactLink kind="phone" href={`tel:${line.tel}`} target={line.display} className="ps-model">
        <bdi dir="ltr" className="tabular-nums">
          {line.display}
        </bdi>
      </ContactLink>
    ),
  };
  const steps: TicketRow = { label: common.stepsLabel, value: c.steps.map((step) => step.title).join(" · ") };
  const rows: TicketRow[] = dubai
    ? [
        {
          label: common.names.showroom,
          value: (
            <span lang="en" dir="ltr">
              {CONTACT.showroomAddress}
            </span>
          ),
        },
        call,
        { label: s.rowHours, value: s.hoursValue },
        { label: s.rowInstall, value: s.installValue },
        steps,
      ]
    : [
        {
          label: s.rowFrom,
          value: (
            <span lang="en" dir="ltr">
              {headOffice?.address}
            </span>
          ),
        },
        { label: s.rowTo, value: s.countries[market] },
        call,
        steps,
      ];

  const jumps = [
    { href: "#models", label: s.jumpModels },
    { href: "#delivery", label: s.jumpDelivery },
    { href: `#${faqId}`, label: s.jumpFaq },
    { href: localePath(locale, "/locations"), label: common.allLocations },
  ];

  return (
    <div className="ps-glass ps-fam">
      <p className="ps-head in-mono">
        <span>{c.title}</span>
      </p>
      <div className="ps-fam-grid">
        <div className="ps-fam-copy">
          <Ticket title={c.eyebrow} titleAs="h2" rows={rows} className="ps-ticket" />
        </div>
      </div>
      <div className="ps-bottom">
        <StagePill href={localePath(locale, page.quote)} prefetch={false}>
          {c.primary}
        </StagePill>
        <div className="ps-jumps" role="group" aria-label={t.productsStage.jumpTo}>
          <span className="in-mono" aria-hidden="true">
            {t.productsStage.jumpTo}
          </span>
          {jumps.map((j) => (
            <Link key={j.href} href={j.href} className="in-chip">
              {j.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
