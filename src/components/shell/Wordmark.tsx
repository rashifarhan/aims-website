import Link from "next/link";

/** Interim wordmark (Design Doc ch. 3) until AIMS supplies its logo. */
export function Wordmark({ href, descriptor }: { href: string; descriptor?: string }) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-baseline gap-2 whitespace-nowrap"
      aria-label="AIMS Security Systems, home"
    >
      <span className="text-[22px] font-extrabold tracking-[0.04em] text-ink" dir="ltr">
        AIMS<span className="text-lime">.</span>
      </span>
      {descriptor && <span className="hidden text-xs font-medium text-ink-600 xl:inline">{descriptor}</span>}
    </Link>
  );
}
