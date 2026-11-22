import Link from "next/link";

/** Interim wordmark (Design Doc ch. 3) until AIMS supplies its logo. */
export function Wordmark({ href, descriptor }: { href: string; descriptor?: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap"
      aria-label="AIMS Security Systems, home"
    >
      <span className="text-wordmark font-extrabold tracking-wordmark text-ink" dir="ltr">
        AIMS
        <svg aria-hidden="true" viewBox="0 0 8 8" width="5" height="5" className="ms-0.5 inline-block fill-lime">
          <circle cx="4" cy="4" r="3" />
        </svg>
      </span>
      {descriptor && <span className="hidden text-xs font-medium text-ink-600 xl:inline"> {descriptor}</span>}
    </Link>
  );
}
