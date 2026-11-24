import { signalOpacity, signalPaths } from "@/lib/signalPaths";

/** Geometry ported from docs/prototypes/hero/aims-hero.html (Design Doc 3 and 8.1; src/lib/signalPaths.ts). */
export function SignalLines({ mobile = false }: { mobile?: boolean }) {
  const width = mobile ? 390 : 1440;
  const height = mobile ? 390 : 760;
  const target = mobile ? { x: 201, y: 210 } : { x: 1146, y: 390 };
  const count = mobile ? 14 : 26;
  const id = mobile ? "home-signals-mobile" : "home-signals-desktop";
  const paths = signalPaths({ width, height, target, count, mobile });
  return (
    <svg
      className={mobile ? "home-signals home-signals-mobile" : "home-signals home-signals-desktop"}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--color-green-700)" stopOpacity="0" />
          <stop offset=".45" stopColor="var(--color-green-700)" stopOpacity=".55" />
          <stop offset="1" stopColor="var(--color-green-700)" stopOpacity=".9" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <path
          key={i}
          data-signal={i}
          d={d}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={i % 5 === 0 ? 1.6 : 1.05}
          opacity={signalOpacity(i, count)}
        />
      ))}
      {paths
        .filter((_, i) => i % 3 === 1)
        .map((d, i) => (
          <path
            key={i}
            data-pulse={i}
            d={d}
            fill="none"
            stroke="var(--color-lime)"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0"
          />
        ))}
    </svg>
  );
}
