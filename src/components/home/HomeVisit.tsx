import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { CONTACT, whatsappUrl } from "@/lib/site";
import { ArrowIcon } from "@/components/icons";
import { ContactLink } from "@/components/contact/ContactLink";
import { FloodHead } from "@/components/families/FloodHead";
import { FloodSection } from "@/components/families/FloodSection";
import { ExternalLink } from "./ExternalLink";

/**
 * Visit or call, on chalk (Locations menu): the Deira showroom address with its directions, and AIMS's published
 * lines (CLAUDE.md, Truth: brief-given). Opening hours are not published, so the lead asks visitors to call ahead.
 * Numbers stay left-to-right.
 */
export async function HomeVisit() {
  const t = await getDictionary();
  const locale = await getLocale();
  const l = t.home.locations;
  const arrow = <ArrowIcon width="18" height="18" className="rtl:-scale-x-100" />;
  const phones = [
    { name: l.headOffice, note: l.dubaiArea, line: CONTACT.lines.headOffice },
    { name: l.showroom, note: l.showroomArea, line: CONTACT.lines.showroom },
    { name: l.abuDhabi, note: l.abuDhabiArea, line: CONTACT.lines.abuDhabi },
  ];
  return (
    <FloodSection id="visit" tone="chalk" labelledBy="visit-title">
      <FloodHead
        id="visit-title"
        kicker={t.nav.locations}
        title={l.heading}
        lead={l.lead}
        link={{ href: localePath(locale, "/locations"), label: l.all }}
      />
      <div className="hv-grid">
        <div>
          <p className="hv-label">{l.showroom}</p>
          <address className="hv-address">
            <bdi lang="en">{CONTACT.showroomAddress}</bdi>
          </address>
          <ExternalLink
            href={CONTACT.showroomMap}
            target="_blank"
            rel="noreferrer"
            label={l.newTab}
            className="home-button hv-map"
          >
            {l.map}
          </ExternalLink>
        </div>
        <ul className="hv-lines">
          {phones.map(({ name, note, line }) => (
            <li key={line.tel}>
              <p>
                <strong>{name}</strong>
                {note}
              </p>
              <ContactLink kind="phone" href={`tel:${line.tel}`} target={line.display} className="hv-tel">
                <span className="sr-only">
                  {l.call} {name}{" "}
                </span>
                <bdi dir="ltr">{line.display}</bdi>
                {arrow}
              </ContactLink>
            </li>
          ))}
          <li>
            <p>
              <strong>{t.footer.mobile}</strong>
              {l.mobileNote}
            </p>
            <ContactLink kind="whatsapp" href={whatsappUrl()} target={CONTACT.lines.mobile.display} className="hv-tel">
              {/* It opens WhatsApp outside the site: said to screen readers too, not only by the label beside it. */}
              <span className="sr-only">{t.common.whatsapp} </span>
              <bdi dir="ltr">{CONTACT.lines.mobile.display}</bdi>
              {arrow}
            </ContactLink>
          </li>
          <li>
            <p>
              <strong>{t.footer.email}</strong>
              {l.emailNote}
            </p>
            <ContactLink kind="email" href={`mailto:${CONTACT.email}`} target={CONTACT.email} className="hv-tel">
              <bdi dir="ltr">{CONTACT.email}</bdi>
              {arrow}
            </ContactLink>
          </li>
        </ul>
      </div>
    </FloodSection>
  );
}
