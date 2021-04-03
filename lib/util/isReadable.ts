import {Readable} from "stream"

const isReadable = (value: unknown): value is Readable => (
  value instanceof Readable
)

export default isReadable
