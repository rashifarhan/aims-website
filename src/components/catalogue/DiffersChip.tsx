/** The "Differs" mark beside a compare row's label (Design Doc 9 compare table). */
export function DiffersChip({ label }: { label: string }) {
  return (
    <span className="ms-2 inline-block rounded-pill bg-green-100 px-2 text-xs font-semibold text-green-800">
      {label}
    </span>
  );
}
