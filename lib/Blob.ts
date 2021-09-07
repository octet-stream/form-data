import {ReadableStream} from "web-streams-polyfill"

import type {BlobPart} from "./BlobPart"

import {isFunction} from "./isFunction"
import {consumeBlobParts} from "./consumeBlobParts"

export interface BlobPropertyBag {
  type?: string
}

// Based on fetch-blob implementation.
export class Blob {
  #parts: BlobPart[] = []

  #type: string = ""

  #size: number = 0

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

  constructor(blobParts: unknown[], options: BlobPropertyBag = {}) {
    options ??= {}

    const encoder = new TextEncoder()
    for (const raw of blobParts) {
      let part: BlobPart
      if (ArrayBuffer.isView(raw)) {
        part = new Uint8Array(raw.buffer.slice(
          raw.byteOffset, raw.byteOffset + raw.byteLength
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

    // TODO: Normalize options
    this.#type = /^[\x20-\x7E]*$/.test(type) ? type : ""

    Object.defineProperties(this, {
      size: {enumerable: true},
      type: {enumerable: true},
      slice: {enumerable: true}
    })
  }

  get type(): string {
    return this.#type
  }

  get size(): number {
    return this.#size
  }

  // eslint-disable-next-line
  slice(start: number = 0, end?: number, contentType?: string): Blob {
    return new Blob([], {type: contentType})
  }

  async text(): Promise<string> {
    const decoder = new TextDecoder()

    let result = ""
    for await (const chunk of consumeBlobParts(this.#parts)) {
      result += decoder.decode(chunk, {stream: true})
    }

    result += decoder.decode()

    return result
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const view = new Uint8Array(this.size)

    let offset = 0
    for await (const chunk of consumeBlobParts(this.#parts)) {
      view.set(chunk, offset)
      offset += chunk.length
    }

    return view.buffer
  }

  stream(): ReadableStream<Uint8Array> {
    const iterator = consumeBlobParts(this.#parts)

    return new ReadableStream<Uint8Array>({
      async pull(controller) {
        const {value, done} = await iterator.next()

        if (done) {
          return controller.close()
        }

        controller.enqueue(value!)
      }
    })
  }

  get [Symbol.toStringTag](): string {
    return "Blob"
  }
}
