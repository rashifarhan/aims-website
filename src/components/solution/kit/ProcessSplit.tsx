import Image from "next/image";
import type { StandIn } from "@/content/standIns";

type Step = { title: string; body: string; owner: string };
type Props = { heading: string; ownerLabel: string; steps: Step[]; photo: StandIn; alt: string };

/**
 * T3 row 6, installation and support with owners (Master Plan 14; Design Doc 10): the steps as
 * one list of rows beside one photograph (a 5/7 split on the page's one split line). The photograph is a licensed stand-in
 * until AIMS supplies its own installation pictures (CLAUDE.md §2); it carries no caption.
 */
export function ProcessSplit({ heading, ownerLabel, steps, photo, alt }: Props) {
  return (
    <section className="section g2m" id="install" aria-labelledby="install-h">
      <div className="wrap grid--middle t3-split grid">
        <div className="span-5 stack-5">
          <h2 id="install-h">{heading}</h2>
          <ol className="rows process-rows">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="rows__name">
                  <span className="process-rows__num mono" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </span>
                <span className="rows__value t-small">
                  <span className="sr-only">{ownerLabel}: </span>
                  {s.owner}
                </span>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="span-7 process-photo start-6">
          <Image
            src={photo.src}
            alt={alt}
            width={photo.width}
            height={photo.height}
            sizes="(min-width: 1024px) 730px, 92vw"
          />
        </div>
      </div>
    </section>
  );
}
