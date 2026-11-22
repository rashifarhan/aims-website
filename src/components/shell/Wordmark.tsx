import Link from "next/link";

/**
 * Interim wordmark (Design Doc ch. 3) until AIMS supplies its logo. The lime full stop is a drawn
 * dot, not a text character: it is decoration (lime is 2.3:1 on white), so it must not be read as
 * text. The word takes its colour from its bar: ink in the header, the light ink on the dark footer.
 */
export function Wordmark({ href, descriptor }: { href: string; descriptor?: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap"
      aria-label="AIMS Security Systems, home"
    >
      <span className="inline-flex items-baseline text-wordmark font-extrabold tracking-wordmark" dir="ltr">
        AIMS
        <svg viewBox="0 0 6 6" className="ms-px size-[0.24em] fill-lime" aria-hidden="true" focusable="false">
          <circle cx="3" cy="3" r="3" />
        </svg>
      </span>
      {/* A space, so the visible words read "AIMS Security Systems" inside the label (WCAG 2.5.3). */}{" "}
      {descriptor && <span className="hidden text-xs font-medium text-ink-600 xl:inline">{descriptor}</span>}
    </Link>
  );
}
