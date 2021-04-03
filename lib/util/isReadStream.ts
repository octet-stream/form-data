import {ReadStream} from "fs"

const isReadStream = (value: unknown): value is ReadStream => (
  value instanceof ReadStream
)

export default isReadStream
