import {statSync, createReadStream, Stats, promises as fs} from "fs"
import {basename} from "path"

import DOMException from "domexception"

import {File, FileLike, FileOptions} from "./File"

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

/**
 * Represends an object referencing a file on a disk
 * Based on [`fetch-blob/from.js`](https://github.com/node-fetch/fetch-blob/blob/a3b0d62b9d88e0fa80af2e36f50ce25222535692/from.js#L32-L72) implementation
 *
 * @api private
 */
class FileFromPath implements Omit<FileLike, "type"> {
  #path: string

  #start: number

  name: string

  size: number

  lastModified: number

  constructor(options: FileFromPathOptions) {
    this.#path = options.path
    this.#start = options.start || 0
    this.name = basename(this.#path)
    this.size = options.size
    this.lastModified = options.lastModified
  }

  slice(start: number, end: number): FileFromPath {
    return new FileFromPath({
      path: this.#path,
      lastModified: this.lastModified,
      size: end - start,
      start
    })
  }

  async* stream(): AsyncGenerator<Buffer, void, undefined> {
    const {mtimeMs} = await fs.stat(this.#path)

    if (mtimeMs > this.lastModified) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
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

  if (!filename) {
    filename = file.name
  }

  if (!options.lastModified) {
    options.lastModified = file.lastModified
  }

  return new File([file], filename, options)
}

/**
 * Creates a `File` referencing the one on a disk by given path. Synchronous version of the `fileFromPath`
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

/**
 * Creates a `File` referencing the one on a disk by given path.
 *
 * @param path Path to read a file from
 * @param filename Optional file name. If not presented, the path will be used to get it
 * @param options File options
 */
export async function fileFromPath(path: string): Promise<File>
export async function fileFromPath(
  path: string,
  filename?: string
): Promise<File>
export async function fileFromPath(
  path: string,
  options?: FileOptions
): Promise<File>
export async function fileFromPath(
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
