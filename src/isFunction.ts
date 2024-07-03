// biome-ignore lint/suspicious/noExplicitAny: Allowed to cover any possible function type
export type AnyFunction = (...args: any[]) => any

export const isFunction = (value: unknown): value is AnyFunction =>
  typeof value === "function"
