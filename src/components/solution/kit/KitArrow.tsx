/** The kit's button arrow (motion.md): its stem draws and its head steps on hover; mirrored in RTL. */
export function KitArrow() {
  return (
    <svg className="m-arrow rtl:-scale-x-100" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path className="m-arrow__stem" d="M1 6h8" />
      <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
    </svg>
  );
}
