import {Readable} from "stream"

import test from "ava"

import {createReadStream, readFile} from "promise-fs"

import StreamIterator from "../../lib/util/StreamIterator"

test("Should have a \"next\" method", t => {
  t.plan(1)

  const iterator = new StreamIterator(createReadStream(__filename))

  t.is(typeof iterator.next, "function")
})

test("The next method should return a Promise", async t => {
  t.plan(1)

  const stream = new Readable({
    read() { this.push(null) }
  })

  const iterator = new StreamIterator(stream)

  const actual = iterator.next()

  t.true(actual instanceof Promise)

  await actual
})

test("Should return a value in correct format", async t => {
  t.plan(3)

  const stream = new Readable({
    read() { /* noop */ }
  })

  stream.push(Buffer.from("I've seen things you people wouldn't believe"))

  const iterator = new StreamIterator(stream)

  const actual = await iterator.next()

  stream.push(null)

  t.deepEqual(Object.keys(actual).sort(), ["done", "value"])
  t.is(String(actual.value), "I've seen things you people wouldn't believe")
  t.false(actual.done)
})

test("Should return corectly object on stream ending", async t => {
  t.plan(1)

  const stream = new Readable({
    read() { this.push(null) }
  })

  const iterator = new StreamIterator(stream)

  const actual = await iterator.next()

  t.deepEqual(actual, {
    done: true,
    value: void 0
  })
})

test("Should corectly reat a content from the stream", async t => {
  const iterator = new StreamIterator(createReadStream("/usr/share/dict/words"))

  const chunks = []

  for await (const chunk of iterator) {
    chunks.push(chunk)
  }

  const expected = await readFile("/usr/share/dict/words")
  const actual = Buffer.concat(chunks)

  t.true(actual.equals(expected))
})
