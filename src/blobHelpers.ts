/*! Based on fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> & David Frank */

import type {Blob, BlobLike} from "./Blob.js"
import type {BlobPart} from "./BlobPart.js"

import {isFunction} from "./isFunction.js"
import {isAsyncIterable} from "./isAsyncIterable.js"

const CHUNK_SIZE = 65536 // 64 KiB (same size chrome slice theirs blob into Uint8array's)

async function* clonePart(value: Uint8Array): AsyncGenerator<Uint8Array, void> {
  if (value.byteLength <= CHUNK_SIZE) {
    yield value

    return
  }

  let offset = 0
  while (offset < value.byteLength) {
    const size = Math.min(value.byteLength - offset, CHUNK_SIZE)
    const buffer = value.buffer.slice(offset, offset + size)

    offset += buffer.byteLength

    yield new Uint8Array(buffer)
  }
}

/**
 * Reads from given ReadableStream
 *
 * @param readable A ReadableStream to read from
 */
export async function* readStream(
  readable: ReadableStream<Uint8Array>
): AsyncGenerator<Uint8Array, void, undefined> {
  const reader = readable.getReader()

  while (true) {
    const {done, value} = await reader.read()

    if (done) {
      break
    }

    yield value
  }
}

export async function* chunkStream(
  stream: AsyncIterable<Uint8Array>
): AsyncGenerator<Uint8Array, void> {
  for await (const value of stream) {
    yield* clonePart(value)
  }
}

/**
 * Turns ReadableStream into async iterable when the `Symbol.asyncIterable` is not implemented on given stream.
 *
 * @param source A ReadableStream to create async iterator for
 */
export const getStreamIterator = (
  source: ReadableStream<Uint8Array> | AsyncIterable<Uint8Array>
): AsyncIterable<Uint8Array> => {
  if (isAsyncIterable(source)) {
    return chunkStream(source)
  }

  if (isFunction(source.getReader)) {
    return chunkStream(readStream(source))
  }

  // Throw an error otherwise (for example, in case if encountered Node.js Readable stream without Symbol.asyncIterator method)
  throw new TypeError(
    "Unsupported data source: Expected either ReadableStream or async iterable."
  )
}

/**
 * Consumes builtin Node.js Blob that does not have stream method.
 */
/* c8 ignore start */
async function* consumeNodeBlob(
  blob: BlobLike
): AsyncGenerator<Uint8Array, void> {
  let position = 0
  while (position !== blob.size) {
    const chunk = blob.slice(
      position,

      Math.min(blob.size, position + CHUNK_SIZE)
    )

    const buffer = await chunk.arrayBuffer()

    position += buffer.byteLength

    yield new Uint8Array(buffer)
  }
}
/* c8 ignore stop */

/**
 * Creates an iterator allowing to go through blob parts and consume their content
 *
 * @param parts blob parts from Blob class
 */
export async function* consumeBlobParts(
  parts: BlobPart[],
  clone: boolean = false
): AsyncGenerator<Uint8Array, void, undefined> {
  for (const part of parts) {
    if (ArrayBuffer.isView(part)) {
      if (clone) {
        yield* clonePart(part)
      } else {
        yield part
      }
    } else if (isFunction((part as Blob).stream)) {
      yield* getStreamIterator((part as Blob).stream())
    /* c8 ignore start */
    } else {
      // Special case for an old Node.js Blob that have no stream() method.
      yield* consumeNodeBlob(part as BlobLike)
    }
    /* c8 ignore stop */
  }
}

export function* sliceBlob(
  blobParts: BlobPart[],
  blobSize: number,
  start: number = 0,
  end?: number
): Generator<BlobPart, void> {
  end ??= blobSize

  let relativeStart = start < 0
    ? Math.max(blobSize + start, 0)
    : Math.min(start, blobSize)

  let relativeEnd = end < 0
    ? Math.max(blobSize + end, 0)
    : Math.min(end, blobSize)

  const span = Math.max(relativeEnd - relativeStart, 0)

  let added = 0
  for (const part of blobParts) {
    if (added >= span) {
      break
    }

    const partSize = ArrayBuffer.isView(part) ? part.byteLength : part.size
    if (relativeStart && partSize <= relativeStart) {
      // Skip the beginning and change the relative
      // start & end position as we skip the unwanted parts
      relativeStart -= partSize
      relativeEnd -= partSize
    } else {
      let chunk: BlobPart

      if (ArrayBuffer.isView(part)) {
        chunk = part.subarray(relativeStart, Math.min(partSize, relativeEnd))
        added += chunk.byteLength
      } else {
        chunk = part.slice(relativeStart, Math.min(partSize, relativeEnd))
        added += chunk.size
      }

      relativeEnd -= partSize
      relativeStart = 0

      yield chunk
    }
  }
}
