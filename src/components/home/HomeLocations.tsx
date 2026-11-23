import { getDictionary } from "@/i18n/dictionaries";
import { CONTACT, LIVE_AIMS, LOCATION_LINES } from "@/lib/site";
import { PhoneIcon } from "@/components/icons";
import { OfficeCard } from "@/components/ui/OfficeCard";
import { ReachBand } from "@/components/ui/ReachBand";
import { ExternalLink } from "./ExternalLink";
import { ReachMap } from "./ReachMap";

/**
 * T1 row 7 on night green. The Deira showroom leads as the place to visit (DESIGN.md North Star, "The
 * Trusted Showroom"); the two offices follow; the map of where AIMS ships is the page's second dealt
 * moment and draws its routes once. Addresses, maps and hours AIMS hasn't published are left out.
 */
export async function HomeLocations() {
  const t = await getDictionary();
  const l = t.home.locations;
  const r = t.home.reach;
  const details = {
    headOffice: { name: l.headOffice, address: l.dubaiArea, tag: l.office },
    showroom: { name: l.showroom, address: CONTACT.showroomAddress, tag: l.showroomTag },
    abuDhabi: { name: l.abuDhabi, address: l.abuDhabiArea, tag: l.office },
  };
  // The showroom first: it is the one place AIMS invites visitors to.
  const order = ["showroom", "headOffice", "abuDhabi"] as const satisfies readonly (typeof LOCATION_LINES)[number][];
  return (
    <ReachBand id="showrooms" titleId="locations-title" heading={r.heading} lead={r.lead} map={<ReachMap labels={r} />}>
      <ul className="ui-office-list">
        {order.map((key) => {
          const place = details[key];
          const line = CONTACT.lines[key];
          const showroom = key === "showroom";
          return (
            <OfficeCard
              key={key}
              tone="night"
              featured={showroom}
              tag={place.tag}
              name={place.name}
              address={place.address}
              addressLang={showroom ? "en" : undefined}
              call={
                <a href={`tel:${line.tel}`} className="home-night-link">
                  <PhoneIcon width="16" height="16" />
                  <span className="sr-only">
                    {l.call} {place.name}{" "}
                  </span>
                  <bdi className="tabular-nums">{line.display}</bdi>
                </a>
              }
              visit={
                showroom ? (
                  <ExternalLink
                    href={CONTACT.showroomMap}
                    target="_blank"
                    rel="noreferrer"
                    label={l.newTab}
                    className="home-night-link"
                  >
                    {l.map}
                  </ExternalLink>
                ) : (
                  <ExternalLink href={LIVE_AIMS.contact} label={t.common.externalSite} className="home-night-link">
                    {l.plan}
                  </ExternalLink>
                )
              }
            />
          );
        })}
      </ul>
    </ReachBand>
  );
}
