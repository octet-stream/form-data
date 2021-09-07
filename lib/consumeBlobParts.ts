import type {BlobPart} from "./BlobPart"
import type {Blob} from "./Blob"

import {isFunction} from "./isFunction"

const CHUNK_SIZE = 65536 // 64 KiB (same size chrome slice theirs blob into Uint8array's)

async function* clonePart(part: Uint8Array): AsyncGenerator<Uint8Array> {
  const end = part.byteOffset + part.byteLength
  let position = part.byteOffset
  while (position <= end) {
    const size = Math.min(end - position, CHUNK_SIZE)
    const chunk = part.buffer.slice(position, position + size)

    position += chunk.byteLength

    yield new Uint8Array(chunk)
  }
}

/**
 * Consumes builtin Node.js Blob that does not have stream method.
 */
async function* consumeNodeBlob(blob: Blob): AsyncGenerator<Uint8Array> {
  let position = 0
  while (position <= blob.size) {
    const chunk = blob.slice(
      position,

      Math.min(blob.size, position + CHUNK_SIZE)
    )

    const buffer = await chunk.arrayBuffer()

    position += buffer.byteLength

    yield new Uint8Array(buffer)
  }
}

/**
 * Creates an iterator allowing to go through blob parts and consume their content
 *
 * @param parts blob parts from Blob class
 */
export async function* consumeBlobParts(
  parts: BlobPart[],
  clone: boolean = false
): AsyncGenerator<Uint8Array> {
  for (const part of parts) {
    if (ArrayBuffer.isView(part)) {
      if (clone) {
        yield* clonePart(part)
      } else {
        yield part
      }
    } else if (isFunction(part.stream)) {
      yield* part.stream()
    } else {
      yield* consumeNodeBlob(part)
    }
  }
}
