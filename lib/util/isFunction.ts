const isFunction = (value: unknown): value is Function => (
  typeof value === "function"
)

export default isFunction
