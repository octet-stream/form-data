import {Readable} from "stream"

import test from "ava"

import {createReadStream, readFile} from "promise-fs"

import read from "../__helper__/readStreamWithAsyncIterator"

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

test("Should return correctly object on stream ending", async t => {
  t.plan(1)

  const stream = new Readable({
    read() { this.push(null) }
  })

  const iterator = new StreamIterator(stream)

  const actual = await iterator.next()

  t.deepEqual(actual, {
    done: true,
    value: undefined
  })
})

test("Should correctly read a content from the stream", async t => {
  const iterator = new StreamIterator(createReadStream("/usr/share/dict/words"))

  const chunks = []

  for await (const chunk of iterator) {
    chunks.push(chunk)
  }

  const expected = await readFile("/usr/share/dict/words")
  const actual = Buffer.concat(chunks)

  t.true(actual.equals(expected))
})

test("Should throw an error from strem event", async t => {
  t.plan(1)

  const stream = createReadStream("/usr/share/dict/words")

  const trap = () => {
    const iterator = new StreamIterator(stream)

    stream.emit("error", new Error("Just an error."))

    const foo = read(iterator)

    return foo
  }


  await t.throws(trap(), "Just an error.")
})
