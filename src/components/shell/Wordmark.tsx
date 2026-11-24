import Link from "next/link";

type Props = { href: string; descriptor?: string; tone?: "light" | "night" };

/** Interim wordmark (Design Doc ch. 3) until AIMS supplies its logo. On night green (the footer) it turns light. */
export function Wordmark({ href, descriptor, tone = "light" }: Props) {
  return (
    <Link
      href={href}
      className="flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap"
      aria-label="AIMS Security Systems, home"
    >
      <span
        className={`ui-display text-wordmark font-extrabold tracking-wordmark ${tone === "night" ? "text-night-text" : "text-ink"}`}
        dir="ltr"
      >
        AIMS<span className="text-lime">.</span>
      </span>
      {descriptor && <span className="hidden text-xs font-medium text-ink-600 xl:inline">{descriptor}</span>}
    </Link>
  );
}
