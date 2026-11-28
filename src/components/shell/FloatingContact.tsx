"use client";

import { useEffect, useState } from "react";
import { ContactLink } from "@/components/contact/ContactLink";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import type { Dictionary } from "@/i18n/dictionaries";
import { CONTACT, whatsappUrl } from "@/lib/site";
import "./floating-contact.css";

type Props = { labels: Dictionary["floatingContact"] };

/**
 * WhatsApp and call, one tap away while the visitor scrolls (owner, 28 Nov 2026, after aimsuae.me's floating
 * buttons). Both reach the line AIMS publishes as "Mobile & WhatsApp" (site.ts), through the preview notice until
 * contact goes live. They wait until the first screen has scrolled away and step aside at the footer, which lists
 * the same lines; hidden, they are inert, so focus never lands on them.
 */
export function FloatingContact({ labels }: Props) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const footer = document.querySelector("footer");
    let atFooter = false;
    let frame = 0;
    const sync = () => {
      frame = 0;
      setOn(window.scrollY > window.innerHeight * 0.6 && !atFooter);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    const observer = new IntersectionObserver(([entry]) => {
      atFooter = entry?.isIntersecting ?? false;
      sync();
    });
    if (footer) observer.observe(footer);
    window.addEventListener("scroll", onScroll, { passive: true });
    sync();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  const line = CONTACT.lines.mobile;
  return (
    <nav className="float-contact" data-on={on || undefined} inert={!on} aria-label={labels.label}>
      <ContactLink
        kind="whatsapp"
        href={whatsappUrl(labels.message)}
        target={line.display}
        message={labels.message}
        className="float-contact-button float-contact-whatsapp"
      >
        <WhatsAppIcon aria-hidden="true" />
        <span className="sr-only">{labels.whatsapp}</span>
      </ContactLink>
      <ContactLink kind="phone" href={`tel:${line.tel}`} target={line.display} className="float-contact-button">
        <PhoneIcon aria-hidden="true" />
        <span className="sr-only">{labels.call}</span>
      </ContactLink>
    </nav>
  );
}
