/** Fills "{name}" placeholders in dictionary strings. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** "1 product" / "12 products" using the dictionary's two forms. */
export const countLabel = (n: number, one: string, many: string) => (n === 1 ? one : fmt(many, { count: n }));
