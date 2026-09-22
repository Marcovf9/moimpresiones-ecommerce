/**
 * Convierte un nombre en slug: minúsculas, sin tildes y con guiones.
 * Debe coincidir con lo que valida el backend: [a-z0-9]+(-[a-z0-9]+)*
 */
export function toSlug(value: string): string {
  return value
    .normalize('NFD')
    // Quita los diacríticos que NFD dejó sueltos (tildes, diéresis, la virgulilla de la ñ).
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
