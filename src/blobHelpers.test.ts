import {ReadableStream} from "node:stream/web"
import {text} from "node:stream/consumers"

import test from "ava"

import {stub} from "sinon"

import {
  getStreamIterator,
  consumeBlobParts,
  clonePart,
  MAX_CHUNK_SIZE
} from "./blobHelpers.js"
import {Blob} from "./Blob.js"

import {isAsyncIterable} from "./isAsyncIterable.js"

test("getStreamIterator: returns AsyncIterable for ReadableStream", t => {
  const stream = new ReadableStream()

  t.true(isAsyncIterable(getStreamIterator(stream)))
})

test("getStreamIterator: iterates over given stream", async t => {
  const expected = "Some text"

  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.enqueue(new TextEncoder().encode(expected))
      controller.close()
    }
  })

  let actual = ""
  const decoder = new TextDecoder()
  for await (const chunk of getStreamIterator(stream)) {
    actual += decoder.decode(chunk, {stream: true})
  }

  actual += decoder.decode()

  t.is(actual, expected)
})

test(
  "getStreamIterator: returns AsyncIterable " +
    "for streams w/o Symbol.asyncIterator",

  t => {
    const stream = new ReadableStream()

    const streamStub = stub(stream, Symbol.asyncIterator).get(() => undefined)

    t.false(getStreamIterator(stream) instanceof ReadableStream)

    streamStub.reset()
  }
)

test("getStreamIterator: iterates over the stream using fallback", async t => {
  const expected = "Some text"

  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.enqueue(new TextEncoder().encode(expected))
      controller.close()
    }
  })

  stub(stream, Symbol.asyncIterator).get(() => undefined)

  let actual = ""
  const decoder = new TextDecoder()
  for await (const chunk of getStreamIterator(stream)) {
    actual += decoder.decode(chunk, {stream: true})
  }

  actual += decoder.decode()

  t.is(actual, expected)
})

test("clonePart: Slices big chunks into smaller pieces", async t => {
  const buf = Buffer.alloc(MAX_CHUNK_SIZE * 2 + MAX_CHUNK_SIZE / 2)

  const chunks: Uint8Array[] = []
  for await (const chunk of clonePart(buf)) {
    chunks.push(chunk)
  }

  t.is(chunks.length, 3)
  t.is(chunks[0].byteLength, MAX_CHUNK_SIZE)
  t.is(chunks[1].byteLength, MAX_CHUNK_SIZE)
  t.is(chunks[2].byteLength, MAX_CHUNK_SIZE / 2)
})

test("consumeBlobParts: Reads Node.js' blob w/o .stream() method", async t => {
  const input = "I beat Twilight Sparkle and all I got was this lousy t-shirt"
  const blob = new Blob([input])

  const blobStub = stub(blob, "stream").get(() => undefined)

  const actual = await text(consumeBlobParts([blob], true))

  t.is(actual, input)

  blobStub.reset()
})

test("getStreamIterator: throws TypeError for unsupported data sources", t => {
  // @ts-expect-error
  const trap = () => getStreamIterator({})

  t.throws(trap, {
    instanceOf: TypeError,
    message:
      "Unsupported data source: Expected either " +
      "ReadableStream or async iterable."
  })
})
