export function titleize(kebabOrLower: string): string {
  if (!kebabOrLower) return ''
  return kebabOrLower
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function nowISO() {
  return new Date().toISOString()
}
