/*! Based on fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> & David Frank */

import {ReadableStream} from "web-streams-polyfill"

import type {BlobPart} from "./BlobPart.js"

import {isFunction} from "./isFunction.js"
import {consumeBlobParts, sliceBlob} from "./blobHelpers.js"

/**
 * Reflects minimal valid Blob for BlobParts.
 */
export interface BlobLike {
  type: string

  size: number

  slice(start?: number, end?: number, contentType?: string): BlobLike

  arrayBuffer(): Promise<ArrayBuffer>

  [Symbol.toStringTag]: string
}

export type BlobParts = unknown[] | Iterable<unknown>

export interface BlobPropertyBag {
  /**
   * The [`MIME type`](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type) of the data that will be stored into the blob.
   * The default value is the empty string, (`""`).
   */
  type?: string
}

/**
 * The **Blob** object represents a blob, which is a file-like object of immutable, raw data;
 * they can be read as text or binary data, or converted into a ReadableStream
 * so its methods can be used for processing the data.
 */
export class Blob {
  /**
   * An `Array` of [`ArrayBufferView`](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView) or [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) objects, or a mix of any of such objects, that will be put inside the [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
   */
  readonly #parts: BlobPart[] = []

  /**
   * Returns the [`MIME type`](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type) of the [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File).
   */
  readonly #type: string = ""

  /**
   * Returns the size of the [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) in bytes.
   */
  readonly #size: number = 0

  static [Symbol.hasInstance](value: unknown): value is Blob {
    return Boolean(
      value
        && typeof value === "object"
        && isFunction((value as Blob).constructor)
        && (
          isFunction((value as Blob).stream)
            || isFunction((value as Blob).arrayBuffer)
        )
        && /^(Blob|File)$/.test((value as Blob)[Symbol.toStringTag])
    )
  }

  /**
   * Returns a new [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) object.
   * The content of the blob consists of the concatenation of the values given in the parameter array.
   *
   * @param blobParts An `Array` strings, or [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`ArrayBufferView`](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView), [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) objects, or a mix of any of such objects, that will be put inside the [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
   * @param options An optional object of type `BlobPropertyBag`.
   */
  constructor(blobParts: BlobParts = [], options: BlobPropertyBag = {}) {
    options ??= {}

    if (typeof blobParts !== "object" || blobParts === null) {
      throw new TypeError(
        "Failed to construct 'Blob': "
          + "The provided value cannot be converted to a sequence."
      )
    }

    if (!isFunction(blobParts[Symbol.iterator])) {
      throw new TypeError(
        "Failed to construct 'Blob': "
          + "The object must have a callable @@iterator property."
      )
    }

    if (typeof options !== "object" && !isFunction(options)) {
      throw new TypeError(
        "Failed to construct 'Blob': parameter 2 cannot convert to dictionary."
      )
    }

    // Normalize blobParts first
    const encoder = new TextEncoder()
    for (const raw of blobParts) {
      let part: BlobPart
      if (ArrayBuffer.isView(raw)) {
        part = new Uint8Array(raw.buffer.slice(
          raw.byteOffset,

          raw.byteOffset + raw.byteLength
        ))
      } else if (raw instanceof ArrayBuffer) {
        part = new Uint8Array(raw.slice(0))
      } else if (raw instanceof Blob) {
        part = raw
      } else {
        part = encoder.encode(String(raw))
      }

      this.#size += ArrayBuffer.isView(part) ? part.byteLength : part.size
      this.#parts.push(part)
    }

    const type = options.type === undefined ? "" : String(options.type)

    this.#type = /^[\x20-\x7E]*$/.test(type) ? type : ""
  }

  /**
   * Returns the [`MIME type`](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type) of the [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File).
   */
  get type(): string {
    return this.#type
  }

  /**
   * Returns the size of the [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) in bytes.
   */
  get size(): number {
    return this.#size
  }

  /**
   * Creates and returns a new [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) object which contains data from a subset of the blob on which it's called.
   *
   * @param start An index into the Blob indicating the first byte to include in the new Blob. If you specify a negative value, it's treated as an offset from the end of the Blob toward the beginning. For example, -10 would be the 10th from last byte in the Blob. The default value is 0. If you specify a value for start that is larger than the size of the source Blob, the returned Blob has size 0 and contains no data.
   * @param end An index into the Blob indicating the first byte that will *not* be included in the new Blob (i.e. the byte exactly at this index is not included). If you specify a negative value, it's treated as an offset from the end of the Blob toward the beginning. For example, -10 would be the 10th from last byte in the Blob. The default value is size.
   * @param contentType The content type to assign to the new Blob; this will be the value of its type property. The default value is an empty string.
   */
  slice(start?: number, end?: number, contentType?: string): Blob {
    return new Blob(sliceBlob(this.#parts, this.size, start, end), {
      type: contentType
    })
  }

  /**
   * Returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves with a string containing the contents of the blob, interpreted as UTF-8.
   */
  async text(): Promise<string> {
    const decoder = new TextDecoder()

    let result = ""
    for await (const chunk of consumeBlobParts(this.#parts)) {
      result += decoder.decode(chunk, {stream: true})
    }

    result += decoder.decode()

    return result
  }

  /**
   * Returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves with the contents of the blob as binary data contained in an [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).
   */
  async arrayBuffer(): Promise<ArrayBuffer> {
    const view = new Uint8Array(this.size)

    let offset = 0
    for await (const chunk of consumeBlobParts(this.#parts)) {
      view.set(chunk, offset)
      offset += chunk.length
    }

    return view.buffer
  }

  /**
   * Returns a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) which upon reading returns the data contained within the [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
   */
  stream(): ReadableStream<Uint8Array> {
    const iterator = consumeBlobParts(this.#parts, true)

    return new ReadableStream<Uint8Array>({
      async pull(controller) {
        const {value, done} = await iterator.next()

        if (done) {
          return queueMicrotask(() => controller.close())
        }

        controller.enqueue(value!)
      },

      async cancel() {
        await iterator.return()
      }
    })
  }

  get [Symbol.toStringTag](): string {
    return "Blob"
  }
}

// Not sure why, but these properties are enumerable.
// Also fetch-blob defines "size", "type" and "slice" as such
Object.defineProperties(Blob.prototype, {
  type: {enumerable: true},
  size: {enumerable: true},
  slice: {enumerable: true},
  stream: {enumerable: true},
  text: {enumerable: true},
  arrayBuffer: {enumerable: true}
})
