/*! Based on fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> & David Frank */

import type {BlobPart} from "./BlobPart.js"
import type {Blob, BlobLike} from "./Blob.js"

import {isFunction} from "./isFunction.js"

const CHUNK_SIZE = 65536 // 64 KiB (same size chrome slice theirs blob into Uint8array's)

async function* clonePart(part: Uint8Array): AsyncGenerator<Uint8Array, void> {
  const end = part.byteOffset + part.byteLength
  let position = part.byteOffset
  while (position !== end) {
    const size = Math.min(end - position, CHUNK_SIZE)
    const chunk = part.buffer.slice(position, position + size)

    position += chunk.byteLength

    yield new Uint8Array(chunk)
  }
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
): AsyncGenerator<Uint8Array, void> {
  for (const part of parts) {
    if (ArrayBuffer.isView(part)) {
      if (clone) {
        yield* clonePart(part)
      } else {
        yield part
      }
    } else if (isFunction((part as Blob).stream)) {
      yield* (part as Blob).stream()
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
