import type { ReactNode } from "react";

type Props = {
  heading: string;
  items: { q: string; a: string }[];
  /** A last row across the container, e.g. a dealt marquee (moments.md: it merges into the section above). */
  after?: ReactNode;
};

/**
 * T3 row 7, the FAQ (Master Plan 14). Every answer stands open (skill system.md, FAQ: no
 * accordion), so nothing hides behind a click and the section reads by keyboard as plain text.
 */
export function FaqSection({ heading, items, after }: Props) {
  return (
    <section className="section" id="faq" aria-labelledby="faq-h">
      <div className="wrap grid--middle t3-split grid">
        <h2 id="faq-h" className="span-4">
          {heading}
        </h2>
        <div className="faq span-7 start-6">
          {items.map((item) => (
            <div key={item.q} className="faq__item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
        {after && <div className="span-12 faq-after">{after}</div>}
      </div>
    </section>
  );
}
