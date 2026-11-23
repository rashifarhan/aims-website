import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { CONTACT } from "@/lib/site";
import { ContactLink } from "@/components/contact/ContactLink";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { PinIcon } from "@/components/icons";
import { LOCATION_PAGES } from "@/lib/locationPages";

export async function LocationOffices() {
  const t = (await getDictionary()).locationsHub;
  const locale = await getLocale();
  const offices = [
    { key: "showroom", name: t.showroom, address: CONTACT.showroomAddress },
    { key: "headOffice", name: t.headOffice, address: t.dubaiArea },
    { key: "abuDhabi", name: t.abuDhabi, address: t.abuDhabiArea },
  ] as const;
  return (
    <section id="uae" className="locations-section">
      <div className="wrap page-container">
        <h2>{t.uaeTitle}</h2>
        <p className="locations-lead">{t.uaeLead}</p>
        <div className="locations-offices">
          {offices.map((office) => {
            const phone = CONTACT.lines[office.key];
            return (
              <article key={office.key}>
                <PinIcon className="text-green-700" aria-hidden="true" />
                <h3>{office.name}</h3>
                <p>{office.address}</p>
                <ContactLink kind="phone" href={`tel:${phone.tel}`} target={phone.display} className="locations-link">
                  {t.call} <bdi dir="ltr">{phone.display}</bdi>
                </ContactLink>
                {office.key === "showroom" && (
                  <a className="locations-link" href={CONTACT.showroomMap} target="_blank" rel="noopener noreferrer">
                    {t.directions}
                    <span className="sr-only"> · {t.mapExternal}</span>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                )}
              </article>
            );
          })}
        </div>
        <div className="locations-office-actions locations-actions">
          <Link prefetch={false} className="locations-primary" href={localePath(locale, "/quote?need=install")}>
            {t.install}
          </Link>
          <Link prefetch={false} className="locations-link" href={localePath(locale, LOCATION_PAGES.dubai.path)}>
            {(await getDictionary()).locationPage.dubai.title}
          </Link>
        </div>
        <div className="locations-faq">
          <h3>{t.faqTitle}</h3>
          <dl>
            {t.faq.map((item) => (
              <div key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
