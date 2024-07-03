/**
 * Checks if given `value` is non-array object
 */
// biome-ignore lint/suspicious/noExplicitAny: Allowd to handle any object
export const isObject = (value: unknown): value is Record<PropertyKey, any> =>
  typeof value === "object" && value != null && !Array.isArray(value)
