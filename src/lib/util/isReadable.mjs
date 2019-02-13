import stream from "stream"

const isReadable = val => val instanceof stream.Readable

export default isReadable
