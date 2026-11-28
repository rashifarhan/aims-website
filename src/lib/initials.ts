/** Up to two initials for a monogram: "Traffic Burger Head Office" → "TB", "Arjun" → "A". */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}
