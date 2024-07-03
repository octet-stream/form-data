import {isFunction} from "./isFunction.js"

export const isReadableStreamFallback = (
  value: unknown
): value is ReadableStream =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  isFunction((value as ReadableStream).getReader)
