import fs from "fs"
import stream from "stream"
import path from "path"

import test from "ava"

import FormData from "../../lib/FormData"

const filePath = path.join(__dirname, "..", "..", "package.json")

test("Should set a primitive value", t => {
  const fd = new FormData()

  fd.set("null", null)
  fd.set("number", 3310)
  fd.set("string", "string")
  fd.set("undefined", undefined)

  // All returned values should be stringified by String() call
  t.is(fd.get("null"), "null")
  t.is(fd.get("number"), "3310")
  t.is(fd.get("string"), "string")
  t.is(fd.get("undefined"), "undefined")
})

test("Should set an array value", t => {
  const fd = new FormData()

  fd.set("array", ["earth pony", "unicorn", "pegasus"])

  t.is(
    fd.get("array"), "earth pony,unicorn,pegasus",
    "Value should be a stringified array."
  )
})

test("Should add an object", t => {
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
  const fd = new FormData()

  fd.set("name", "John")

  fd.set("name", "Max")

  t.is(fd.get("name"), "Max")
})

test("Should not allow to .append() new value to an existing key", t => {
  const fd = new FormData()

  fd.set("name", "John")

  fd.append("name", "Max")

  t.deepEqual(fd.getAll("name"), ["John"])
})

test("Should set a Readable stream", t => {
  const fd = new FormData()

  fd.set("stream", fs.createReadStream(filePath))

  t.true(fd.get("stream") instanceof stream.Readable)
})

test("Should correctly add a field with Buffer data", t => {
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

test(
  "Should set a correctly header with given filename for a Buffer value",
  async t => {
    const buffer = Buffer.from(
      "I beat Twilight Sparkle and all I got was this lousy t-shirt"
    )

    const fd = new FormData()

    fd.set("file", buffer, "note.txt")

    const iterator = fd[Symbol.asyncIterator]()

    const {value} = await iterator.next()

    t.true(
      String(value).startsWith(
        `--${fd.boundary}\r\n` +
        "Content-Disposition: form-data; name=\"file\"; filename=\"note.txt\"" +
        "\r\nContent-Type: \"text/plain\"\r\n\r\n"
      )
    )
  }
)

test(
  "Should throw a TypeError on field setting when the name is not a string",
  t => {
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
    const fd = new FormData()

    const trap = () => fd.set("key", "value", 451)

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(
      err.message, "Filename should be a string (if passed). Received number"
    )
  }
)
