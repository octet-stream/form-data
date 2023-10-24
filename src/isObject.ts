/**
 * Checks if given `value` is non-array object
 */
export const isObject = (
  value: unknown
): value is Record<PropertyKey, any> => typeof value === "object"
  && value != null
  && !Array.isArray(value)
