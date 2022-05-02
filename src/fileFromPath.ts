import {statSync, createReadStream} from "node:fs"
import {stat} from "node:fs/promises"
import type {Stats} from "node:fs"
import {basename} from "node:path"

import DOMException from "node-domexception"

import type {FileLike, FilePropertyBag} from "./File.js"
import {File} from "./File.js"

import isPlainObject from "./isPlainObject.js"

export * from "./isFile.js"

const MESSAGE = "The requested file could not be read, "
  + "typically due to permission problems that have occurred after a reference "
  + "to a file was acquired."

export type FileFromPathOptions = Omit<FilePropertyBag, "lastModified">

interface FileFromPathInput {
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

  constructor(input: FileFromPathInput) {
    this.#path = input.path
    this.#start = input.start || 0
    this.name = basename(this.#path)
    this.size = input.size
    this.lastModified = input.lastModified
  }

  slice(start: number, end: number): FileFromPath {
    return new FileFromPath({
      path: this.#path,
      lastModified: this.lastModified,
      start: this.#start + start,
      size: end - start
    })
  }

  async* stream(): AsyncGenerator<Buffer, void, undefined> {
    const {mtimeMs} = await stat(this.#path)

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
  filenameOrOptions?: string | FileFromPathOptions,
  options: FileFromPathOptions = {}
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

  return new File([file], filename, {
    ...options, lastModified: file.lastModified
  })
}

/**
 * Creates a `File` referencing the one on a disk by given path. Synchronous version of the `fileFromPath`
 *
 * @param path Path to a file
 * @param filename Optional name of the file. Will be passed as the second argument in `File` constructor. If not presented, the name will be taken from the file's path.
 * @param options Additional `File` options, except for `lastModified`.
 *
 * @example
 *
 * ```js
 * import {FormData, File} from "formdata-node"
 * import {fileFromPathSync} from "formdata-node/file-from-path"
 *
 * const form = new FormData()
 *
 * const file = fileFromPathSync("/path/to/some/file.txt")
 *
 * form.set("file", file)
 *
 * form.get("file") // -> Your `File` object
 * ```
 */
export function fileFromPathSync(path: string): File
export function fileFromPathSync(path: string, filename?: string): File
export function fileFromPathSync(
  path: string,
  options?: FileFromPathOptions
): File
export function fileFromPathSync(
  path: string,
  filename?: string,
  options?: FileFromPathOptions
): File
export function fileFromPathSync(
  path: string,
  filenameOrOptions?: string | FileFromPathOptions,
  options: FileFromPathOptions = {}
): File {
  const stats = statSync(path)

  return createFileFromPath(path, stats, filenameOrOptions, options)
}

/**
 * Creates a `File` referencing the one on a disk by given path.
 *
 * @param path Path to a file
 * @param filename Optional name of the file. Will be passed as the second argument in `File` constructor. If not presented, the name will be taken from the file's path.
 * @param options Additional `File` options, except for `lastModified`.
 *
 * @example
 *
 * ```js
 * import {FormData, File} from "formdata-node"
 * import {fileFromPath} from "formdata-node/file-from-path"
 *
 * const form = new FormData()
 *
 * const file = await fileFromPath("/path/to/some/file.txt")
 *
 * form.set("file", file)
 *
 * form.get("file") // -> Your `File` object
 * ```
 */
export async function fileFromPath(path: string): Promise<File>
export async function fileFromPath(
  path: string,
  filename?: string
): Promise<File>
export async function fileFromPath(
  path: string,
  options?: FileFromPathOptions
): Promise<File>
export async function fileFromPath(
  path: string,
  filename?: string,
  options?: FileFromPathOptions
): Promise<File>
export async function fileFromPath(
  path: string,
  filenameOrOptions?: string | FileFromPathOptions,
  options?: FileFromPathOptions
): Promise<File> {
  const stats = await stat(path)

  return createFileFromPath(path, stats, filenameOrOptions, options)
}
