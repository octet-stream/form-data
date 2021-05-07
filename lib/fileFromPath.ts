import {statSync, createReadStream, Stats, promises as fs} from "fs"
import {basename} from "path"

import DOMException from "domexception"

import {File, FileOptions} from "./File"

import isPlainObject from "./util/isPlainObject"

const MESSAGE = "The requested file could not be read, "
  + "typically due to permission problems that have occurred after a reference "
  + "to a file was acquired."

interface FileFromPathOptions {
  path: string

  start?: number

  size: number

  lastModified: number
}

class FileFromPath {
  #path: string

  #start: number

  size: number

  lastModified: number

  constructor(options: FileFromPathOptions) {
    this.#path = options.path
    this.#start = options.start || 0
    this.size = options.size
    this.lastModified = options.lastModified
  }

  slice(start: number, end: number) {
    return new FileFromPath({
      path: this.#path,
      lastModified: this.lastModified,
      size: end - start,
      start
    })
  }

  async* stream() {
    const {mtimeMs} = await fs.stat(this.#path)

    if (mtimeMs > this.lastModified) {
      throw new DOMException(MESSAGE, "NotReadableError")
    }

    if (this.size) {
      yield* createReadStream(this.#path, {
        start: this.#start,
        end: this.#start + this.size - 1
      })
    }
  }

  get [Symbol.toStringTag]() {
    return "File"
  }
}

function createFileFromPath(
  path: string,
  {mtimeMs, size}: Stats,
  filenameOrOptions?: string | FileOptions,
  options: FileOptions = {}
): File {
  let filename: string | undefined
  if (isPlainObject(filenameOrOptions)) {
    [options, filename] = [filenameOrOptions, undefined]
  } else {
    filename = filenameOrOptions
  }

  const file = new FileFromPath({path, size, lastModified: mtimeMs})

  if (!options.lastModified) {
    options.lastModified = mtimeMs
  }

  return new File([file as any], filename || basename(path), options)
}

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
  return createFileFromPath(path, statSync(path), filenameOrOptions, options)
}

export function fileFromPath(path: string): Promise<File>
export function fileFromPath(path: string, filename?: string): Promise<File>
export function fileFromPath(path: string, options?: FileOptions): Promise<File>
export function fileFromPath(
  path: string,
  filename?: string,
  options?: FileOptions
): Promise<File>
export async function fileFromPath(
  path: string,
  filenameOrOptions?: string | FileOptions,
  options?: FileOptions
): Promise<File> {
  const stats = await fs.stat(path)

  return createFileFromPath(path, stats, filenameOrOptions, options)
}
