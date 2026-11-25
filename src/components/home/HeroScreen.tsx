import { HeroTick } from "./HeroTick";

type Labels = {
  entrance: string;
  time: string;
  day: string;
  idle: string;
  scanning: string;
  welcome: string;
  checked: string;
  unlocked: string;
};

/**
 * The SpeedFace screen's three states from the approved hero prototype (Design Doc 8.1): idle, scanning a face, and
 * verified. HeroAnimation cross-fades them in a loop; at rest (and under reduced motion) the verified state shows.
 */
export function HeroScreen({ labels: h }: { labels: Labels }) {
  return (
    <div className="home-device-screen" aria-hidden="true">
      <div className="home-device-bar">
        <span>{h.entrance}</span>
        <bdi>{h.time}</bdi>
      </div>
      <div data-screen="idle" className="home-screen-state home-idle">
        <bdi className="home-clock">{h.time}</bdi>
        <span className="home-day">{h.day}</span>
        <span className="home-screen-hint">{h.idle}</span>
      </div>
      <div data-screen="scan" className="home-screen-state home-scan">
        <svg viewBox="0 0 100 110" className="home-face">
          <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="1.5 3.2">
            <ellipse cx="50" cy="40" rx="20" ry="25" />
            <path d="M14 108C16 82 32 72 50 72S84 82 86 108" />
          </g>
          <g fill="currentColor">
            <circle cx="42" cy="38" r="1.6" />
            <circle cx="58" cy="38" r="1.6" />
            <circle cx="50" cy="47" r="1.3" />
          </g>
        </svg>
        <span className="home-scan-brackets">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span data-beam className="home-scan-beam" />
        <span className="home-screen-hint">{h.scanning}</span>
      </div>
      <div data-screen="verified" className="home-screen-state home-verified">
        <span className="home-device-tick">
          <HeroTick />
        </span>
        <strong>{h.welcome}</strong>
        <span className="home-checked">{h.checked}</span>
        <span className="home-unlocked">{h.unlocked}</span>
      </div>
    </div>
  );
}
