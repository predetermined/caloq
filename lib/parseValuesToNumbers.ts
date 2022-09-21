export function parseValuesToNumbers<T extends Record<string, unknown>>(
  obj: T
): Record<keyof T, number> {
  const result: Record<string, number> = {};

  for (const key in obj) {
    result[key] = Number.isNaN(Number(obj[key])) ? 0 : Number(obj[key]);
  }

  return result as Record<keyof T, number>;
}
