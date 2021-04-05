import {basename} from "path"
import {statSync} from "fs"

import blobFromPathSync from "fetch-blob/from.js"

import {File, FileOptions} from "./File"

/**
 * Creates a new File from Blob backed by filesystem
 *
 * @param path Path to read a file from
 * @param filename Optional file name. If not presented, the path will be used to get it
 * @param options File options
 */
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
