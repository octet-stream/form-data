import {customAlphabet} from "nanoid"

const alpha = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

/**
 * @api private
 */
const boundary = customAlphabet(alpha, 22)

export default boundary
