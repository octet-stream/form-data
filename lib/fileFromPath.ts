import {basename} from "path"
import {statSync} from "fs"

// @ts-ignore
import blobFromPath from "fetch-blob/from.js"

import Blob from "fetch-blob"

import {File, FileOptions} from "./File"

export function fileFromPathSync(
  path: string,
  filename?: string,
  options: FileOptions = {}
): File {
  if (!options.lastModified) {
    options.lastModified = statSync(path).mtimeMs
  }

  const blob = blobFromPath(path) as Blob

  return new File([blob], filename || basename(path), options)
}
