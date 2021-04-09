import {ReadStream} from "fs"

import Blob from "fetch-blob"

import isReadStream from "./isReadStream"
import isFile from "./isFile"

import {File} from "../File"

type FileLike = ReadStream | File | Blob | Buffer

/**
 * Returns filename for File, Blob and streams (where possible)
 */
function getFilename(value: FileLike): string {
  if (isReadStream(value)) {
    return String(value.path)
  }

  if (isFile(value) && value.name) {
    return value.name
  }

  return "blob"
}

export default getFilename
