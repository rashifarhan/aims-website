import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { ContactLink } from "@/components/contact/ContactLink";
import { NavigationLink as Link } from "./NavigationLink";
import { LanguageSwitch } from "./LanguageSwitch";
import type { Locale } from "@/i18n/config";

type Props = {
  labels: { external: string; quote: string; whatsapp: string; call: string; language: string };
  hrefs: { quote: string; whatsapp: string; whatsappDisplay: string; tel: string; telDisplay: string };
  otherLocale: Locale;
  onNavigate: () => void;
};

/** The sheet's foot: Quote, WhatsApp and Call, the language switch last (Design Doc 6). */
export function MobileMenuActions({ labels, hrefs, otherLocale, onNavigate }: Props) {
  return (
    <div className="grid gap-2 border-t border-line p-4">
      <Link externalLabel={labels.external} href={hrefs.quote} onClick={onNavigate} className="home-button w-full">
        {labels.quote}
      </Link>
      <div className="grid grid-cols-2 gap-2">
        <ContactLink
          kind="whatsapp"
          href={hrefs.whatsapp}
          target={hrefs.whatsappDisplay}
          className="home-button home-button-whatsapp"
        >
          <WhatsAppIcon width={18} height={18} />
          {labels.whatsapp}
        </ContactLink>
        <ContactLink
          kind="phone"
          href={`tel:${hrefs.tel}`}
          target={hrefs.telDisplay}
          className="home-button home-button-outline"
        >
          <PhoneIcon width={18} height={18} />
          {labels.call}
        </ContactLink>
      </div>
      <LanguageSwitch
        target={otherLocale}
        label={labels.language}
        className="mt-1 flex h-11 items-center justify-center text-sm font-semibold text-ink-700"
      />
    </div>
  );
}
