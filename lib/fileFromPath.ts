import {basename} from "path"
import {statSync} from "fs"

import blobFromPathSync from "fetch-blob/from.js"

import {File, FileOptions} from "./File"

export function fileFromPathSync(
  path: string,
  filename?: string,
  options: FileOptions = {}
): File {
  if (!options.lastModified) {
    options.lastModified = statSync(path).mtimeMs
  }

  const blob = blobFromPathSync(path)

  return new File([blob], filename || basename(path), options)
}
