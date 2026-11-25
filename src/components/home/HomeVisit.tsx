import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { CONTACT, whatsappUrl } from "@/lib/site";
import { ArrowIcon } from "@/components/icons";
import { ContactLink } from "@/components/contact/ContactLink";
import { ReachBand } from "@/components/ui/ReachBand";
import { ExternalLink } from "./ExternalLink";
import { ReachMap } from "./ReachMap";

/**
 * T1 showroom, offices and reach: the home preview of the Locations menu (client decision, 25 Nov 2026). The shared
 * reach band (ui/ReachBand), on the light band with the light map (the client kept night green to the software band
 * and the close), carries the Deira showroom address to visit and AIMS's real lines (CLAUDE.md §1,
 * brief-given) beside the reach map, the page's dealt moment: its routes draw once when the map is a third on
 * screen and rest drawn under reduced motion (signature/reach.css). Opening hours are not published, so the lead asks
 * visitors to call ahead. Numbers stay left-to-right (CLAUDE.md §7).
 */
export async function HomeVisit() {
  const t = await getDictionary();
  const locale = await getLocale();
  const l = t.home.locations;
  const arrow = <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />;
  const phones = [
    { name: l.headOffice, note: l.dubaiArea, line: CONTACT.lines.headOffice },
    { name: l.showroom, note: l.showroomArea, line: CONTACT.lines.showroom },
    { name: l.abuDhabi, note: l.abuDhabiArea, line: CONTACT.lines.abuDhabi },
  ];
  return (
    <ReachBand
      ground="band"
      id="showrooms"
      titleId="locations-title"
      heading={l.heading}
      lead={l.lead}
      link={
        <Link href={localePath(locale, "/locations")} className="home-secondary">
          {l.all}
          <ArrowIcon width="16" height="16" className="home-action-arrow rtl:-scale-x-100" />
        </Link>
      }
      map={<ReachMap labels={t.home.reach} />}
      trigger="map"
    >
      <div className="home-visit">
        <div className="home-visit-address">
          <p className="home-visit-label">{l.showroom}</p>
          <address>
            <bdi lang="en">{CONTACT.showroomAddress}</bdi>
          </address>
          <ExternalLink
            href={CONTACT.showroomMap}
            target="_blank"
            rel="noreferrer"
            label={l.newTab}
            className="home-secondary"
          >
            {l.map}
          </ExternalLink>
        </div>
        <ul className="home-visit-lines">
          {phones.map(({ name, note, line }) => (
            <li key={line.tel}>
              <p>
                <strong>{name}</strong>
                {note}
              </p>
              <ContactLink kind="phone" href={`tel:${line.tel}`} target={line.display} className="home-visit-tel">
                <span className="sr-only">
                  {l.call} {name}{" "}
                </span>
                <bdi dir="ltr" className="tabular-nums">
                  {line.display}
                </bdi>
                {arrow}
              </ContactLink>
            </li>
          ))}
          <li>
            <p>
              <strong>{t.footer.mobile}</strong>
              {l.mobileNote}
            </p>
            <ContactLink
              kind="whatsapp"
              href={whatsappUrl()}
              target={CONTACT.lines.mobile.display}
              className="home-visit-tel"
            >
              {/* It opens WhatsApp outside the site: said to screen readers too, not only by the label beside it. */}
              <span className="sr-only">{t.common.whatsapp} </span>
              <bdi dir="ltr" className="tabular-nums">
                {CONTACT.lines.mobile.display}
              </bdi>
              {arrow}
            </ContactLink>
          </li>
          <li>
            <p>
              <strong>{t.footer.email}</strong>
              {l.emailNote}
            </p>
            <ContactLink
              kind="email"
              href={`mailto:${CONTACT.email}`}
              target={CONTACT.email}
              className="home-visit-tel"
            >
              <bdi dir="ltr">{CONTACT.email}</bdi>
              {arrow}
            </ContactLink>
          </li>
        </ul>
        <p className="home-visit-reach">{t.home.reach.lead}</p>
      </div>
    </ReachBand>
  );
}
