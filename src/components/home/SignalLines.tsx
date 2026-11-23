/** Geometry ported from docs/prototypes/hero/aims-hero.html (Design Doc 3 and 8.1). */
export function SignalLines({ mobile = false }: { mobile?: boolean }) {
  const width = mobile ? 390 : 1440;
  const height = mobile ? 390 : 760;
  const target = mobile ? { x: 201, y: 210 } : { x: 1146, y: 390 };
  const count = mobile ? 14 : 26;
  const id = mobile ? "home-signals-mobile" : "home-signals-desktop";
  const paths = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const sx = mobile ? -40 + t * (width + 80) : t < 0.62 ? 600 + (t / 0.62) * (width - 560) : width + 30;
    const sy = mobile || t < 0.62 ? height + 30 : height - 80 - ((t - 0.62) / 0.38) * (height - 40);
    const c1x = sx + (target.x - sx) * 0.15 + (mobile ? 0 : -60);
    const c1y = sy - (sy - target.y) * 0.55 - (mobile ? 40 : 90) * Math.sin(t * Math.PI);
    const c2x = target.x - (target.x - sx) * 0.35;
    const c2y = target.y + (sy - target.y) * 0.25;
    return `M${sx.toFixed(1)} ${sy.toFixed(1)} C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${target.x} ${target.y}`;
  });
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
          opacity={(i % 5 === 0 ? 0.65 : 0.22) + 0.35 * Math.sin((i / (count - 1)) * Math.PI)}
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
