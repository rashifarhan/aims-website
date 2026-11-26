import Image from "next/image";
import Link from "next/link";
import { COMPANY_FIGURES, CONTACT, LOCATIONS, whatsappUrl } from "@/lib/site";
import { AddToQuote } from "./AddToQuote";
import type { BeatData } from "./beatData";
import { QuoteCta } from "./QuoteCta";
import { ALSO_IN_BUILDING } from "./story";

const PLACE: Record<string, string> = { headOffice: "Head office", showroom: "Showroom", abuDhabi: "Abu Dhabi office" };

/**
 * After the film: the system the visitor just walked through, each product with AIMS's own photo, then the proof
 * (authorization, figures stated by AIMS) and the people to visit or call. Ordinary page content, readable without
 * the film.
 */
export function SystemSection({
  beats,
  authorized,
  figureLabels,
  figureNote,
  paths,
}: {
  beats: BeatData[];
  authorized: string;
  figureLabels: Record<string, string>;
  figureNote: string;
  paths: { quote: string; services: string; product: (s: string) => string; software: (s: string) => string };
}) {
  return (
    <section id="your-system" className="sys" aria-labelledby="sys-title">
      <p className="sys-eyebrow">Your system</p>
      <h2 id="sys-title" className="sys-title">
        Everything in this building, from one ZKTeco partner.
      </h2>
      <p className="sys-lead">
        Supplied, installed and supported across the UAE by AIMS, {authorized.replace(" · UAE", "")}.
      </p>
      <ul className="sys-grid">
        {beats.map((b) => (
          <li key={b.key} className="sys-item">
            {b.image ? (
              <Image
                src={b.image.src}
                alt={b.image.alt}
                width={b.image.width}
                height={b.image.height}
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="sys-img"
              />
            ) : (
              <div className="sys-img sys-img-empty" aria-hidden="true" />
            )}
            <p className="beat-model" dir="ltr">
              {b.model}
            </p>
            <h3 className="sys-name">
              <Link href={b.links[0]?.href ?? paths.services}>{b.name}</Link>
            </h3>
            <AddToQuote quote={b.quote} name={b.name} />
          </li>
        ))}
      </ul>
      <p className="sys-also">
        <span>Also in this building:</span>
        {ALSO_IN_BUILDING.map((a) => (
          <Link key={a.slug} href={a.kind === "product" ? paths.product(a.slug) : paths.software(a.slug)}>
            {a.name}
          </Link>
        ))}
      </p>
      <QuoteCta href={paths.quote} />

      <div className="sys-proof">
        <p className="sys-badge">{authorized}</p>
        <dl className="sys-figures">
          {COMPANY_FIGURES.map((f) => (
            <div key={f.key}>
              <dt>{figureLabels[f.key]}</dt>
              <dd>
                {f.value.toLocaleString("en")}
                {f.suffix}
              </dd>
            </div>
          ))}
        </dl>
        <p className="sys-note">{figureNote}</p>
      </div>

      <ul className="sys-places">
        {LOCATIONS.map((l) => (
          <li key={l.id}>
            <strong>{PLACE[l.id]}</strong>
            <span>{l.address}</span>
            <a href={`tel:${CONTACT.lines[l.line].tel}`} dir="ltr">
              {CONTACT.lines[l.line].display}
            </a>
            <a href={l.map} target="_blank" rel="noreferrer">
              Open in Maps ↗
            </a>
          </li>
        ))}
        <li>
          <strong>WhatsApp</strong>
          <span>Send a model code and a quantity.</span>
          <a href={whatsappUrl()} target="_blank" rel="noreferrer" dir="ltr">
            {CONTACT.lines.mobile.display}
          </a>
          <Link href={paths.services}>Installation and support →</Link>
        </li>
      </ul>
    </section>
  );
}
