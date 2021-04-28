import {basename} from "path"
import {statSync} from "fs"

import blobFromPathSync from "fetch-blob/from.js"

import {File, FileOptions} from "./File"

import isPlainObject from "./util/isPlainObject"

/**
 * Creates a `File` referencing the one on a disk by given path.
 *
 * @param path Path to read a file from
 * @param filename Optional file name. If not presented, the path will be used to get it
 * @param options File options
 */
export function fileFromPathSync(path: string): File
export function fileFromPathSync(path: string, filename?: string): File
export function fileFromPathSync(path: string, options?: FileOptions): File
export function fileFromPathSync(
  path: string,
  filename?: string,
  options?: FileOptions
): File
export function fileFromPathSync(
  path: string,
  filenameOrOptions?: string | FileOptions,
  options: FileOptions = {}
): File {
  let filename: string | undefined
  if (isPlainObject(filenameOrOptions)) {
    [options, filename] = [filenameOrOptions, undefined]
  } else {
    filename = filenameOrOptions
  }

  if (!options.lastModified) {
    options.lastModified = statSync(path).mtimeMs
  }

  const blob = blobFromPathSync(path)

  return new File([blob], filename || basename(path), options)
}
