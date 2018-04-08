import generate from "nanoid/generate"

const alpha = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

const boundary = () => generate(alpha, 22)

export default boundary
