import {Readable} from "stream"
import {join} from "path"

import {ReadStream, createReadStream} from "fs"

import test from "ava"
import Blob from "fetch-blob"

import FormData from "../../lib/FormData"
import FileLike from "../../lib/util/File"

import File from "../__helper__/File"
import read from "../__helper__/read"

const filePath = join(__dirname, "..", "..", "package.json")

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

  fd.set("stream", createReadStream(filePath))

  t.true(fd.get("stream") instanceof ReadStream)
})

test("Applies given Readable stream as well as ReadStream", t => {
  const fd = new FormData()

  fd.set("stream", new Readable({read() { }}))

  t.true(fd.get("stream") instanceof Readable)
})

test("Should correctly add a field with Buffer data", async t => {
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

  t.true(actual instanceof FileLike)
  t.true((await read(actual.stream())).equals(phrase))
})

test("Supports Blob as a field", t => {
  const fd = new FormData()

  const blob = new Blob(["Some text"], {type: "text/plain"})

  fd.set("file", blob, "file.txt")

  const actual = fd.get("file")

  t.true(actual instanceof FileLike)
})

test("Sets default name for a Blob field as \"blob\"", t => {
  const fd = new FormData()

  const blob = new Blob(["Some text"], {type: "text/plain"})

  fd.set("file", blob)

  const actual = fd.get("file")

  t.is(actual.name, "blob")
})

test("Supports File as a field", t => {
  const fd = new FormData()

  fd.set("file", new File(["Some text"], "file.txt", {type: "text/plain"}))

  t.true(fd.get("file") instanceof File)
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
        "\r\nContent-Type: text/plain\r\n\r\n"
      )
    )
  }
)

test(
  "Applies filename from 3rd argument for stream that have no path prop",
  async t => {
    const buffer = Buffer.from(
      "I beat Twilight Sparkle and all I got was this lousy t-shirt"
    )

    const field = new Readable({
      read() {
        this.push(buffer)
        this.push(null)
      }
    })

    const fd = new FormData()

    fd.set("file", field, "file.txt")

    const iterator = fd[Symbol.asyncIterator]()

    const {value} = await iterator.next()

    t.true(
      String(value).startsWith(
        `--${fd.boundary}\r\n` +
        "Content-Disposition: form-data; name=\"file\"; filename=\"file.txt\"" +
        "\r\nContent-Type: text/plain\r\n\r\n"
      )
    )
  }
)

test("Throws a TypeError when less than 2 arguments has been set", t => {
  const fd = new FormData()

  const trap = () => fd.set("name")

  const err = t.throws(trap)

  t.true(err instanceof TypeError)
  t.is(
    err.message,

    "Failed to execute 'set' on 'FormData': " +
    "2 arguments required, but only 1 present."
  )
})

test(
  "Throws a TypeError when a filename parameter" +
  "has been set for non-binary value type",
  t => {
    const fd = new FormData()

    const trap = () => fd.set("name", "Just a string", "file.txt")

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(
      err.message,

      "Failed to execute 'set' on 'FormData': " +
      "parameter 2 is not one of the following types: ",
      "ReadableStream | ReadStream | Readable | Buffer | File | Blob"
    )
  }
)
