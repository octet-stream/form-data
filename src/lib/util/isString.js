import getType from "./getType"

const isString = val => getType(val) === "string"

export default isString
