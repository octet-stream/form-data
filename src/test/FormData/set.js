import {createReadStream} from "fs"
import {Readable} from "stream"

import test from "ava"

import FormData from "../../lib/FormData"

test("Should set a primitive value", t => {
  t.plan(4)

  const fd = new FormData()

  fd.set("null", null)
  fd.set("number", 3310)
  fd.set("string", "string")
  fd.set("undefined", void 0)

  // All returned values should be stringified by String() call
  t.is(fd.get("null"), "null")
  t.is(fd.get("number"), "3310")
  t.is(fd.get("string"), "string")
  t.is(fd.get("undefined"), "undefined")
})

test("Should set an array value", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("array", ["earth pony", "unicorn", "pegasus"])

  t.is(
    fd.get("array"), "earth pony,unicorn,pegasus",
    "Value should be a stringified array."
  )
})

test("Should add an object", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("object", {
    name: "John Doe"
  })

  t.is(
    fd.get("object"), "[object Object]",
    "Value should be just a stringified object"
  )
})

test("Should replace an existing field", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("name", "John")

  fd.set("name", "Max")

  t.is(fd.get("name"), "Max")
})

test("Should not allow to .append() new value to an existing key", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("name", "John")

  fd.append("name", "Max")

  t.deepEqual(fd.getAll("name"), ["John"])
})

test("Should set a Readable stream", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("stream", createReadStream(__filename))

  t.true(fd.get("stream") instanceof Readable)
})

test("Should correctly add a field with Buffer data", t => {
  t.plan(2)

  const phrase = Buffer.from(
    "I've seen things you people wouldn't believe. " +
    "Attack ships on fire off the shoulder of Orion. " +
    "I watched C-beams glitter in the dark near the Tannhäuser Gate. " +
    "All those moments will be lost in time, like tears in rain. " +
    "Time to die."
  )

  const fd = new FormData()

  fd.set("buffer", phrase)

  const actual = fd.get("buffer")

  t.true(actual instanceof Buffer)
  t.true(actual.equals(phrase))
})

test("Should set given filename for a Buffer value", async t => {
  t.plan(2)

  const buffer = Buffer.from(
    "I beat Twilight Sparkle and all I got was this lousy t-shirt"
  )

  const fd = new FormData()

  fd.set("file", buffer, "note.txt")

  const iterator = fd[Symbol.asyncIterator]()

  const {value} = await iterator.next()

  const [head, body] = String(value).split("\r\n\r\n")

  t.is(
    String(head),
    `--${fd.boundary}\r\n` +
    "Content-Disposition: form-data; name=\"file\"; filename=\"note.txt\"" +
    "\r\nContent-Type: \"text/plain\""
  )

  t.is(
    String(body),
    "I beat Twilight Sparkle and all I got was this lousy t-shirt"
  )
})

test(
  "Should throw a TypeError on field setting when the name is not a string",
  t => {
    t.plan(3)

    const fd = new FormData()

    const trap = () => fd.set({})

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(err.message, "Field name should be a string. Received object")
  }
)

test(
  "Should throw a TypeError on field setting when the filename passed, " +
  "but it's not a string value.",
  t => {
    t.plan(3)

    const fd = new FormData()

    const trap = () => fd.set("key", "value", 451)

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(
      err.message, "Filename should be a string (if passed). Received number"
    )
  }
)
