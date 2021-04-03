import {randomBytes} from "crypto"

const createBoundary = (): string => randomBytes(16).toString("hex")

export default createBoundary
