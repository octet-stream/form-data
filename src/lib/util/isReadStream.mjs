import fs from "fs"

const isReadStream = value => value instanceof fs.ReadStream

export default isReadStream
