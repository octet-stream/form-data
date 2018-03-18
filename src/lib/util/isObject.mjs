import getType from "./getType"

const isObject = val => getType(val) === "object"

export default isObject
