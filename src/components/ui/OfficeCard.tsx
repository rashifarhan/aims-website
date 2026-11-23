import type { ReactNode } from "react";
import { PinIcon } from "@/components/icons";

/**
 * One AIMS place as the one card (design-taste-frontend one system; DESIGN.md Plinth Rule): an optional tag,
 * the name, the address and two actions (call, then map or visit). `featured` marks the Deira showroom, the
 * one place AIMS invites visitors to (DESIGN.md "The Trusted Showroom"); `night` sets it on night green. The
 * actions come ready-made because each page keeps its own behaviour (the preview contact notice, external
 * marks). No opening hours: AIMS hasn't published them (CLAUDE.md §1). `media` is AIMS's own photograph of
 * the place, edge to edge at the card's top, once AIMS supplies one (site.ts SHOWROOM_PHOTO).
 */
export function OfficeCard({
  name,
  address,
  addressLang,
  tag,
  featured = false,
  tone = "paper",
  media,
  call,
  visit,
}: {
  name: string;
  address: string;
  /** AIMS's English address on an Arabic page stays lang="en", left-to-right (CLAUDE.md §7). */
  addressLang?: "en";
  tag?: string;
  featured?: boolean;
  tone?: "paper" | "night";
  media?: ReactNode;
  call: ReactNode;
  visit: ReactNode;
}) {
  const classes = ["ui-card", "ui-office", `ui-office-${tone}`, featured ? "ui-office-featured" : ""];
  return (
    <li className={classes.join(" ").trim()}>
      {media && <div className="ui-office-media">{media}</div>}
      {tag && (
        <p className="ui-office-tag">
          <PinIcon width="16" height="16" />
          {tag}
        </p>
      )}
      <h3>{name}</h3>
      <p className="ui-office-address" lang={addressLang} dir={addressLang ? "ltr" : undefined}>
        {address}
      </p>
      <div className="ui-office-actions">
        {call}
        {visit}
      </div>
    </li>
  );
}
