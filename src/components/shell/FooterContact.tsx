import { CONTACT, whatsappUrl } from "@/lib/site";
import { PinIcon, WhatsAppIcon } from "@/components/icons";
import { ContactLink } from "@/components/contact/ContactLink";
import { footerLinkClass } from "./FooterLinks";

type Labels = {
  locations: string;
  headOffice: string;
  showroom: string;
  abuDhabi: string;
  mobile: string;
  email: string;
  directions: string;
};

const labelClass = "flex items-center gap-1.5 text-xs text-night-muted";
const valueClass = `${footerLinkClass} font-medium text-night-text`;
/* The directions link keeps its underline at rest so it reads as a link beside the plain address; on hover the
   underline brightens. */
const directionsClass =
  "font-medium text-night-text underline decoration-night-muted/60 underline-offset-4 transition-[text-decoration-color,opacity] duration-(--duration-hover) ease-[ease] hover:decoration-current active:opacity-75";

/**
 * The footer's "Visit or call" block: AIMS's real lines, email and showroom (CLAUDE.md §1, brief-given), as a
 * contact grid with each label over its number, the way professional footers set office contacts (client
 * request, 24 Nov 2026). From 640px to 1279px its four columns share the link columns' lines below it. Numbers, email and the English address stay left-to-right inside Arabic (CLAUDE.md §7).
 */
export function FooterContact({ t }: { t: Labels }) {
  const lines = [
    { label: t.headOffice, line: CONTACT.lines.headOffice },
    { label: t.showroom, line: CONTACT.lines.showroom },
    { label: t.abuDhabi, line: CONTACT.lines.abuDhabi },
  ];
  return (
    <div className="site-footer-contact">
      <h2 className="text-sm font-semibold text-night-text">{t.locations}</h2>
      <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-4 xl:grid-cols-2">
        {lines.map((p) => (
          <li key={p.line.tel}>
            <span className={labelClass}>{p.label}</span>
            <ContactLink
              kind="phone"
              href={`tel:${p.line.tel}`}
              target={p.line.display}
              className={`${valueClass} tabular-nums`}
            >
              <span dir="ltr">{p.line.display}</span>
            </ContactLink>
          </li>
        ))}
        <li>
          <span className={labelClass}>
            <WhatsAppIcon width={14} height={14} className="shrink-0 text-whatsapp-on-night" />
            {t.mobile}
          </span>
          <ContactLink
            kind="whatsapp"
            href={whatsappUrl()}
            target={CONTACT.lines.mobile.display}
            className={`${valueClass} tabular-nums`}
          >
            <span dir="ltr">{CONTACT.lines.mobile.display}</span>
          </ContactLink>
        </li>
        <li>
          <span className={labelClass}>{t.email}</span>
          <ContactLink kind="email" href={`mailto:${CONTACT.email}`} target={CONTACT.email} className={valueClass}>
            <span dir="ltr">{CONTACT.email}</span>
          </ContactLink>
        </li>
        <li className="col-span-2 sm:col-span-3 xl:col-span-2">
          <span className={labelClass}>
            <PinIcon width={14} height={14} className="shrink-0" />
            {t.showroom}
          </span>
          <p className="mt-1.5 text-night-text">
            <span dir="ltr">{CONTACT.showroomAddress}</span>
          </p>
          <a href={CONTACT.showroomMap} target="_blank" rel="noopener noreferrer" className={directionsClass}>
            {t.directions}
            <span className="sr-only"> ({t.showroom}, Google Maps)</span>
          </a>
        </li>
      </ul>
    </div>
  );
}
