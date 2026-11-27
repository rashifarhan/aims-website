import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { CONTACT, LOCATIONS, whatsappUrl } from "@/lib/site";
import { ContactLink } from "@/components/contact/ContactLink";
import { ExternalLink } from "@/components/home/ExternalLink";

/**
 * Let's talk in person (direction 2, paper): the lanyard from the hero returns as a visitor pass for the Deira showroom
 * (decorative, it repeats the list), beside AIMS's three branches as published, each with its own line and map link,
 * then the mobile and email lines. Opening hours are not published, so the lead asks visitors to call ahead. Numbers
 * stay left to right.
 */
export async function InsideVisit() {
  const t = await getDictionary();
  const locale = await getLocale();
  const l = t.home.locations;
  const i = t.home.inside;
  const names = { headOffice: l.headOffice, showroom: l.showroom, abuDhabi: l.abuDhabi };
  const branches = [...LOCATIONS].sort((a, b) => Number(b.id === "showroom") - Number(a.id === "showroom"));
  return (
    <section id="showrooms" className="in-paper in-section hv" aria-labelledby="locations-title">
      <div className="hv-grid">
        <div className="hv-pass" aria-hidden="true">
          <svg className="hv-lanyard" viewBox="0 0 120 330" fill="none">
            <path d="M30 0C40 140 52 230 62 300M92 0C84 140 72 230 62 300" />
            <rect x="50" y="292" width="24" height="30" rx="6" />
          </svg>
          <div className="hv-card">
            <span className="hv-slot" />
            <p className="hv-card-top">
              <span className="hv-wordmark" dir="ltr">
                AIMS<i>.</i>
              </span>
              <span className="in-mono">{i.visitor}</span>
            </p>
            <p className="hv-word" dir="ltr">
              {i.passWord}
            </p>
            <span className="hv-bar" />
            <dl className="in-ticket-rows in-mono">
              <div>
                <dt>{i.passShowroom}</dt>
                <dd>{i.passAddress}</dd>
              </div>
              <div>
                <dt>{i.passArea}</dt>
                <dd>{i.passAreaValue}</dd>
              </div>
              <div>
                <dt>{i.passCall}</dt>
                <dd dir="ltr">{CONTACT.lines.showroom.display}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="hv-text" data-reveal>
          <p className="in-eyebrow">{t.nav.locations}</p>
          <h2 id="locations-title" className="in-h2">
            {l.heading}
          </h2>
          <p className="in-lead">{l.lead}</p>
          <ul className="hv-list">
            {branches.map((branch) => {
              const line = CONTACT.lines[branch.line];
              return (
                <li key={branch.id}>
                  <div>
                    <h3>{names[branch.id]}</h3>
                    <address>
                      <bdi lang="en">{branch.address}</bdi>
                    </address>
                  </div>
                  <div className="hv-actions">
                    <ContactLink kind="phone" href={`tel:${line.tel}`} target={line.display} className="hv-tel">
                      <span className="sr-only">
                        {l.call} {names[branch.id]}{" "}
                      </span>
                      <bdi dir="ltr">{line.display}</bdi>
                    </ContactLink>
                    <ExternalLink
                      href={branch.map}
                      target="_blank"
                      rel="noreferrer"
                      label={l.newTab}
                      className="in-link"
                    >
                      {t.footer.directions}
                    </ExternalLink>
                  </div>
                </li>
              );
            })}
            <li className="hv-more">
              <ContactLink
                kind="whatsapp"
                href={whatsappUrl()}
                target={CONTACT.lines.mobile.display}
                className="hv-tel"
              >
                <bdi dir="ltr">{CONTACT.lines.mobile.display}</bdi>
                <span className="sr-only">
                  {" "}
                  {t.common.whatsapp}, {l.newTab}
                </span>
              </ContactLink>
              <ContactLink kind="email" href={`mailto:${CONTACT.email}`} target={CONTACT.email} className="hv-tel">
                <bdi dir="ltr">{CONTACT.email}</bdi>
              </ContactLink>
              <Link href={localePath(locale, "/locations")} className="in-link">
                {l.all}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
