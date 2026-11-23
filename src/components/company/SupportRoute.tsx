/** The hero tick's path (src/components/home/HeroTick.tsx), with pathLength so it can stroke in. */
const TICK = "m5 12 4.5 4.5L19 7";

/** Two lines from the channels' centres (25 %, 75 % of their column) into the support node. */
const IN = ["M0 25C45 25 60 50 100 50", "M0 75C45 75 60 50 100 50"];

/**
 * Support's dealt moment, SIGNAL into VERIFY (Design Doc 8): AIMS's two published support channels,
 * WhatsApp and email, draw into its technical support team, and the route ends in the check. No phone
 * line is drawn because AIMS names none for support. Once, when the process section is in view
 * (MomentTrigger; timing in company.css); reduced motion rests on the final frame. Decorative: the
 * steps below say the same in text.
 */
export function SupportRoute({ channels, team }: { channels: [string, string]; team: string }) {
  return (
    <div className="support-route flex items-stretch gap-2 sm:gap-3" aria-hidden="true">
      <ul className="grid min-w-0 shrink gap-2">
        {channels.map((label) => (
          <li
            key={label}
            className="truncate rounded-pill bg-green-50 px-3 py-1 text-xs font-medium text-green-800 sm:text-sm"
          >
            {label}
          </li>
        ))}
      </ul>
      {/* Sized by its box, not its viewBox: the lines stretch to the channels' height at any width. */}
      <span className="relative min-w-6 grow sm:max-w-24">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full text-green-700 rtl:-scale-x-100"
          fill="none"
        >
          {IN.map((d) => (
            <path
              key={d}
              d={d}
              pathLength={1}
              className="sr-in"
              stroke="currentColor"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </span>
      <span className="sr-node shrink-0 self-center rounded-pill bg-green-700 px-3 py-1.5 text-xs font-semibold text-paper sm:text-sm">
        {team}
      </span>
      <span className="relative min-w-6 grow sm:max-w-20">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full text-green-700"
          fill="none"
        >
          <path
            d="M0 50H100"
            pathLength={1}
            className="sr-out"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>
      <span className="sr-disc grid size-12 shrink-0 place-items-center self-center rounded-pill bg-green-700 text-paper">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d={TICK} pathLength={1} className="sr-tick" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}
