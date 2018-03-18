import generate from "nanoid/generate"

const alpha = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

const isNumber = val => typeof val === "number"

const boundary = size => generate(alpha, size && isNumber(size) ? size : 22)

export default boundary
