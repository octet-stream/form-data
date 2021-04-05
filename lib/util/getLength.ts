import {promises as fs} from "fs"

import isReadStream from "./isReadStream"
import isBlob from "./isBlob"

const {isBuffer} = Buffer
const {stat} = fs

async function getLength(value: unknown): Promise<number> {
  if (isReadStream(value)) {
    return stat(value.path).then(({size}) => size)
  }

  if (isBuffer(value)) {
    return value.length
  }

  if (isBlob(value)) {
    return value.size
  }

  return Buffer.from(String(value)).length
}

export default getLength
