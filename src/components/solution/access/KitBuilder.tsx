"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { fmt } from "@/i18n/format";
import { KIT_LIMITS, doorKitLines, stepKit, type KitPart } from "@/lib/doorKit";
import { dispatchQuote, useQuote } from "@/lib/quote/useQuote";

export type KitProduct = {
  slug: string;
  model: string;
  /** The product name, for the panel picture's alt text. */
  alt: string;
  image?: { src: string; width: number; height: number };
};

export type KitLabels = {
  doors: string;
  users: string;
  fewerDoors: string;
  moreDoors: string;
  fewerUsers: string;
  moreUsers: string;
  parts: Record<KitPart, string>;
  software: string;
  softwareLine: string;
  softwareNote: string;
  add: string;
  added: string;
  controllerChanged: string;
  more: string;
  review: string;
};

type Props = {
  intro: ReactNode;
  labels: KitLabels;
  /** Every product the kit can name, by slug (the server resolves them from the catalogue). */
  products: Record<string, KitProduct>;
  quoteHref: string;
};

const SOFTWARE_LINE_ID = "door-kit-zkaccess";

function Counter(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  fewer: string;
  more: string;
  onStep: (direction: 1 | -1) => void;
}) {
  const id = useId();
  return (
    <div className="kit__counter" role="group" aria-labelledby={id}>
      <span id={id} className="kit__counter-label">
        {props.label}
      </span>
      <button
        type="button"
        className="kit__step"
        aria-label={props.fewer}
        disabled={props.value <= props.min}
        onClick={() => props.onStep(-1)}
      >
        −
      </button>
      <output className="kit__value tabular-nums" aria-live="polite">
        {props.value}
      </output>
      <button
        type="button"
        className="kit__step"
        aria-label={props.more}
        disabled={props.value >= props.max}
        onClick={() => props.onStep(1)}
      >
        +
      </button>
    </div>
  );
}

/**
 * The kit builder (Design Doc 10, FIG 10.7; 8.4 "Kit builder"): doors and users drive the
 * quantities, the controller switches with the doors (announced), and one action adds the kit to
 * the quote store (aims.quote.v1) as product lines plus one software line.
 */
export function KitBuilder({ intro, labels, products, quoteHref }: Props) {
  const quote = useQuote();
  const [doors, setDoors] = useState(1);
  const [users, setUsers] = useState(20);
  const [announce, setAnnounce] = useState("");
  const [added, setAdded] = useState(false);
  // Counts controller switches: the row remounts and plays its tint once (Design Doc 8.4).
  const [swaps, setSwaps] = useState(0);
  const lines = doorKitLines(doors, users);
  const panelSlug = lines.find((l) => l.part === "controller")?.slug;
  const panel = panelSlug ? products[panelSlug] : undefined;

  const changeDoors = (direction: 1 | -1) => {
    const next = stepKit("doors", doors, direction);
    const before = doorKitLines(doors, users).find((l) => l.part === "controller")?.slug;
    const after = doorKitLines(next, users).find((l) => l.part === "controller")?.slug;
    setDoors(next);
    setAdded(false);
    if (after && after !== before) {
      setSwaps((n) => n + 1);
      setAnnounce(fmt(labels.controllerChanged, { name: products[after]?.model ?? after }));
    }
  };

  const addKit = () => {
    for (const line of lines) dispatchQuote({ type: "add", slug: line.slug, qty: line.qty });
    if (!quote.lines.some((l) => l.kind === "custom" && l.id === SOFTWARE_LINE_ID))
      dispatchQuote({ type: "addCustom", id: SOFTWARE_LINE_ID, text: labels.softwareLine, qty: 1 });
    setAdded(true);
    setAnnounce(fmt(labels.added, { count: lines.length + 1 }));
  };

  return (
    <div className="wrap kit t3-split grid">
      <div className="span-5 kit__intro">
        {intro}
        <div className="kit__counters">
          <Counter
            label={labels.doors}
            value={doors}
            min={KIT_LIMITS.minDoors}
            max={KIT_LIMITS.maxDoors}
            fewer={labels.fewerDoors}
            more={labels.moreDoors}
            onStep={changeDoors}
          />
          <Counter
            label={labels.users}
            value={users}
            min={KIT_LIMITS.minUsers}
            max={KIT_LIMITS.maxUsers}
            fewer={labels.fewerUsers}
            more={labels.moreUsers}
            onStep={(d) => {
              setUsers(stepKit("users", users, d));
              setAdded(false);
            }}
          />
        </div>
        <p className="kit__more">{labels.more}</p>
        {/* The section's picture: the panel the doors call for, changing with them. */}
        {panel?.image && (
          <Image
            key={panel.slug}
            src={panel.image.src}
            alt={panel.alt}
            width={panel.image.width}
            height={panel.image.height}
            sizes="(min-width: 1024px) 320px, 60vw"
            className="kit__panel"
          />
        )}
      </div>
      {/* The builder's list is live UI (data-ui: the skill reads it as the section's mock). */}
      <div className="span-7 kit__list start-6" data-ui="">
        <ul className="rows">
          {lines.map((line) => {
            const p = products[line.slug];
            return (
              <li
                key={line.part === "controller" ? `controller-${swaps}` : line.part}
                className={line.part === "controller" && swaps > 0 ? "kit__row kit__row--swap" : "kit__row"}
              >
                <span className="rows__name kit__part">
                  {labels.parts[line.part]}
                  <small dir="ltr">{p?.model ?? line.slug}</small>
                </span>
                <span className="rows__value">{line.qty}</span>
              </li>
            );
          })}
          <li className="kit__row">
            <span className="rows__name kit__part">
              {labels.software}
              <small>{labels.softwareNote}</small>
            </span>
            <span className="rows__value">1</span>
          </li>
        </ul>
        <div className="btn-row kit__actions">
          <button type="button" className="btn btn--secondary" onClick={addKit}>
            {labels.add}
          </button>
          {added && (
            <Link href={quoteHref} className="link">
              {labels.review}
            </Link>
          )}
        </div>
        <p role="status" className="kit__status">
          {announce}
        </p>
      </div>
    </div>
  );
}
