import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { localePath } from "@/i18n/config";
import { CONTACT, ZKTECO_AUTHORIZATION_CONFIRMED, whatsappUrl } from "@/lib/site";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import { ContactLink } from "@/components/contact/ContactLink";
import { Wordmark } from "./Wordmark";

/** The footer's first column: wordmark, partner note, the published phone lines, email and showroom address. */
export async function FooterContact() {
  const t = await getDictionary();
  const locale = await getLocale();

  const phones = [
    { label: t.footer.headOffice, line: CONTACT.lines.headOffice },
    { label: t.footer.showroom, line: CONTACT.lines.showroom },
    { label: t.footer.abuDhabi, line: CONTACT.lines.abuDhabi },
  ];

  return (
    <div>
      <Wordmark href={localePath(locale, "/")} />
      <p className="mt-3 max-w-xs text-sm text-ink-600">
        {ZKTECO_AUTHORIZATION_CONFIRMED ? t.common.partnerConfirmed : t.common.partner}
      </p>

      <h2 className="mt-8 text-sm font-semibold text-ink">{t.footer.locations}</h2>
      <ul className="mt-3 grid grid-cols-[16px_auto_1fr] items-center gap-x-3 gap-y-2.5 text-sm">
        {phones.map((p) => (
          <li key={p.line.tel} className="col-span-3 grid grid-cols-subgrid items-center">
            <PhoneIcon width={16} height={16} className="shrink-0 text-ink-400" />
            <span className="text-ink-600">{p.label}</span>
            <ContactLink
              kind="phone"
              href={`tel:${p.line.tel}`}
              target={p.line.display}
              className="font-medium text-ink tabular-nums hover:text-green-700"
            >
              <span dir="ltr">{p.line.display}</span>
            </ContactLink>
          </li>
        ))}
        <li className="col-span-3 grid grid-cols-subgrid items-center">
          <WhatsAppIcon width={16} height={16} className="shrink-0 text-whatsapp" />
          <span className="text-ink-600">{t.footer.mobile}</span>
          <ContactLink
            kind="whatsapp"
            href={whatsappUrl()}
            target={CONTACT.lines.mobile.display}
            className="font-medium text-ink tabular-nums hover:text-green-700"
          >
            <span dir="ltr">{CONTACT.lines.mobile.display}</span>
          </ContactLink>
        </li>
        <li className="col-span-3 grid grid-cols-subgrid items-center">
          <MailIcon width={16} height={16} className="shrink-0 text-ink-400" />
          <span className="text-ink-600">{t.footer.email}</span>
          <ContactLink
            kind="email"
            href={`mailto:${CONTACT.email}`}
            target={CONTACT.email}
            className="font-medium text-ink hover:text-green-700"
          >
            {CONTACT.email}
          </ContactLink>
        </li>
        <li className="col-span-3 grid grid-cols-subgrid items-start">
          <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-ink-400" />
          <span className="col-span-2 text-ink-600">
            {CONTACT.showroomAddress} ·{" "}
            <a
              href={CONTACT.showroomMap}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink underline decoration-line-strong underline-offset-2 hover:text-green-700"
            >
              {t.footer.directions}
              <span className="sr-only"> ({t.footer.showroom}, Google Maps)</span>
            </a>
          </span>
        </li>
      </ul>
    </div>
  );
}
