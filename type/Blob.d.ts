// <reference types="node" />
import {Readable} from "stream"

declare type BlobParts = Array<string | Buffer | Blob | ArrayBuffer>

declare type BlobOptions = {
  type?: string
}

declare interface Blob {
  size: number

  type: string

  new (parts: BlobParts, options?: BlobOptions)

  arrayBuffer(): Promise<ArrayBuffer>

  slice(start?: number, end?: number, contentType?: string): Blob

  stream(): Readable | ReadableStream
}

export {BlobParts, BlobOptions, Blob as default}
