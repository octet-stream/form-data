import {ReadStream} from "fs"

import Blob from "fetch-blob"

import isReadStream from "./isReadStream"

import {File} from "../File"

type FileLike = ReadStream | File | Blob

/**
 * Returns filename for File, Blob and streams (where possible)
 */
function getFilename(value: FileLike): string {
  if (value instanceof File && value.constructor.name === "File") {
    return value.name
  }

  if (isReadStream(value)) {
    return String(value.path)
  }

  // ? Not sure what default filename should be set for ReadableStram and Readable
  return "blob"
}

export default getFilename
