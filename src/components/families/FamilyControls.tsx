import type { FamilySlide } from "./familySlides";
import type { SliderLabels } from "./FamilySlider";

type Props = {
  slides: FamilySlide[];
  /** The family on screen, which the tab bar marks. */
  shown: number;
  /** The family the arrows step from: the one a jump is heading to, else the one on screen. */
  base: number;
  labels: SliderLabels;
  onGo: (index: number) => void;
};

/**
 * The stage's controls once it pins (Design rules → Components): the frosted tab bar and the two circle arrows, each
 * naming the family it goes to. They move the scroll; the families themselves stay in the page as regions.
 */
export function FamilyControls({ slides, shown, base, labels, onGo }: Props) {
  const count = slides.length;
  const prev = slides[(base - 1 + count) % count];
  const next = slides[(base + 1) % count];
  return (
    <>
      <nav className="fam-tabs" aria-label={labels.tabs}>
        {slides.map((s, k) => (
          <button
            key={s.slug}
            type="button"
            className="fam-tab"
            aria-current={k === shown ? "true" : undefined}
            aria-controls={`family-${s.slug}`}
            onClick={() => onGo(k)}
          >
            {s.name}
          </button>
        ))}
      </nav>
      {prev && (
        <button
          type="button"
          className="fam-arrow fam-prev"
          onClick={() => onGo(base - 1)}
          aria-label={labels.previous.replace("{name}", prev.name)}
        >
          <span className="fam-arrow-ring" aria-hidden="true">
            <ArrowGlyph className="rotate-180 rtl:rotate-0" />
          </span>
          <em dir="ltr">{prev.word}</em>
        </button>
      )}
      {next && (
        <button
          type="button"
          className="fam-arrow fam-next"
          onClick={() => onGo(base + 1)}
          aria-label={labels.next.replace("{name}", next.name)}
        >
          <em dir="ltr">{next.word}</em>
          <span className="fam-arrow-ring" aria-hidden="true">
            <ArrowGlyph className="rtl:rotate-180" />
          </span>
        </button>
      )}
    </>
  );
}

function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 12h15M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
