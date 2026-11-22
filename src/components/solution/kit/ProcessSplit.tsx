import Image from "next/image";
import type { Picture } from "@/content/cutouts";

type Step = { title: string; body: string; owner: string };
type Props = {
  heading: string;
  ownerLabel: string;
  steps: Step[];
  /** A licensed stand-in photograph ("cover") or an AIMS product cut-out ("contain"). */
  photo: Picture;
  fit?: "cover" | "contain";
  alt: string;
};

/**
 * T3 row 6, installation and support with owners (Master Plan 14; Design Doc 10): the steps as
 * one list of rows beside one picture, a 5/7 split on the page's one split line. A stand-in
 * photograph shows until AIMS supplies its own installation pictures (CLAUDE.md §2); no caption.
 */
export function ProcessSplit({ heading, ownerLabel, steps, photo, fit = "cover", alt }: Props) {
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
        <div className={`span-7 process-photo start-6 process-photo--${fit}`}>
          <Image
            src={photo.src}
            alt={alt}
            width={photo.width}
            height={photo.height}
            // A cover photograph is cropped to its frame (4:3 on a desktop, a full screen's height on a
            // phone), so it is fetched wider than the frame to never upscale.
            sizes={fit === "cover" ? "(min-width: 1024px) 1100px, 340vw" : "(min-width: 1024px) 730px, 92vw"}
          />
        </div>
      </div>
    </section>
  );
}
