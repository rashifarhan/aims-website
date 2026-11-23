import { CONTACT, whatsappUrl } from "@/lib/site";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
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

const valueClass = `${footerLinkClass} font-medium text-ink`;
/* A link inside running text keeps its underline at rest (WCAG 1.4.1); on hover the underline darkens. */
const directionsClass =
  "font-medium text-ink underline decoration-line-strong underline-offset-4 transition-[text-decoration-color,opacity] duration-(--duration-hover) ease-[ease] hover:decoration-current active:opacity-75";

/**
 * The footer's "Visit or call" list: AIMS's real lines, email and showroom (CLAUDE.md §1, brief-given). The
 * numbers, email and English address stay left-to-right inside Arabic (CLAUDE.md §7), so they never reorder
 * around the Arabic labels.
 */
export function FooterContact({ t }: { t: Labels }) {
  const phones = [
    { label: t.headOffice, line: CONTACT.lines.headOffice },
    { label: t.showroom, line: CONTACT.lines.showroom },
    { label: t.abuDhabi, line: CONTACT.lines.abuDhabi },
  ];
  return (
    <>
      <h2 className="mt-8 text-sm font-semibold text-ink">{t.locations}</h2>
      <ul className="mt-3 grid grid-cols-[16px_auto_1fr] items-center gap-x-3 gap-y-2.5 text-sm">
        {phones.map((p) => (
          <li key={p.line.tel} className="col-span-3 grid grid-cols-subgrid items-center">
            <PhoneIcon width={16} height={16} className="shrink-0 text-ink-400" />
            <span className="text-ink-600">{p.label}</span>
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
        <li className="col-span-3 grid grid-cols-subgrid items-center">
          <WhatsAppIcon width={16} height={16} className="shrink-0 text-whatsapp" />
          <span className="text-ink-600">{t.mobile}</span>
          <ContactLink
            kind="whatsapp"
            href={whatsappUrl()}
            target={CONTACT.lines.mobile.display}
            className={`${valueClass} tabular-nums`}
          >
            <span dir="ltr">{CONTACT.lines.mobile.display}</span>
          </ContactLink>
        </li>
        <li className="col-span-3 grid grid-cols-subgrid items-center">
          <MailIcon width={16} height={16} className="shrink-0 text-ink-400" />
          <span className="text-ink-600">{t.email}</span>
          <ContactLink kind="email" href={`mailto:${CONTACT.email}`} target={CONTACT.email} className={valueClass}>
            <span dir="ltr">{CONTACT.email}</span>
          </ContactLink>
        </li>
        <li className="col-span-3 grid grid-cols-subgrid items-start">
          <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-ink-400" />
          <span className="col-span-2 text-ink-600">
            <span dir="ltr">{CONTACT.showroomAddress}</span> ·{" "}
            <a href={CONTACT.showroomMap} target="_blank" rel="noopener noreferrer" className={directionsClass}>
              {t.directions}
              <span className="sr-only"> ({t.showroom}, Google Maps)</span>
            </a>
          </span>
        </li>
      </ul>
    </>
  );
}
