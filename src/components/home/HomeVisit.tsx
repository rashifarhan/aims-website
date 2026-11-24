import { getDictionary } from "@/i18n/dictionaries";
import { CONTACT, whatsappUrl } from "@/lib/site";
import { ArrowIcon } from "@/components/icons";
import { ContactLink } from "@/components/contact/ContactLink";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ExternalLink } from "./ExternalLink";

/**
 * T1 showroom and offices, premium pass (client decision 6, 24 Nov 2026): the Deira showroom address to visit on the
 * start side, AIMS's real lines (CLAUDE.md §1, brief-given) as one list on the end side, and where AIMS supplies.
 * Opening hours are not published, so the lead asks visitors to call ahead. Numbers stay left-to-right (CLAUDE.md §7).
 */
export async function HomeVisit() {
  const t = await getDictionary();
  const l = t.home.locations;
  const arrow = <ArrowIcon width="18" height="18" className="home-action-arrow rtl:-scale-x-100" />;
  const phones = [
    { name: l.headOffice, note: l.dubaiArea, line: CONTACT.lines.headOffice },
    { name: l.showroom, note: l.showroomArea, line: CONTACT.lines.showroom },
    { name: l.abuDhabi, note: l.abuDhabiArea, line: CONTACT.lines.abuDhabi },
  ];
  return (
    <Section id="showrooms" labelledBy="locations-title" className="home-visit">
      <div className="home-visit-grid">
        <div>
          <SectionHeader id="locations-title" title={l.heading} lead={l.lead} />
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
        </div>
        <div>
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
      </div>
    </Section>
  );
}
