import stream from "stream"
import path from "path"

import test from "ava"
import fs from "promise-fs"
import Blob from "fetch-blob"

import FormData from "../../lib/FormData"
import FileLike from "../../lib/util/File"

import read from "../__helper__/read"
import File from "../__helper__/File"

const filePath = path.join(__dirname, "..", "..", "package.json")

test("Returns \"undefined\" on getting nonexistent field", t => {
  const fd = new FormData()

  t.is(fd.get("nope"), undefined)
})

test("Returns a value of the existing field by given name", t => {
  const fd = new FormData()

  fd.set("name", "John Doe")

  t.is(fd.get("name"), "John Doe")
})

test("Returns only the first value of the field", t => {
  const fd = new FormData()

  fd.append("name", "John Doe")
  fd.append("name", "Max Doe")

  t.is(fd.get("name"), "John Doe")
})

test("Returns a stringified values", t => {
  const fd = new FormData()

  fd.set("null", null)
  fd.set("undefined", undefined)
  fd.set("number", 0)
  fd.set("array", [23, 19])
  fd.set("object", {key: "value"})

  t.is(fd.get("null"), "null")
  t.is(fd.get("undefined"), "undefined")
  t.is(fd.get("number"), "0")
  t.is(fd.get("array"), "23,19")
  t.is(fd.get("object"), "[object Object]")
})

test("Returns fs.ReadStream stream as-is", async t => {
  const expected = await fs.readFile(filePath)

  const fd = new FormData()

  fd.set("stream", fs.createReadStream(filePath))

  const actual = fd.get("stream")

  t.true(actual instanceof fs.ReadStream)
  t.true((await read(actual)).equals(expected))
})

test("Returns Buffer value as File", async t => {
  const buffer = await fs.readFile(filePath)

  const fd = new FormData()

  fd.set("buffer", buffer)

  const actual = fd.get("buffer")

  t.true(actual instanceof FileLike)
})

test("Returns Blob value as File", t => {
  const blob = new Blob(["Some text"], {type: "text/plain"})

  const fd = new FormData()

  fd.set("blob", blob, "file.txt")

  const actual = fd.get("blob")

  t.true(actual instanceof FileLike)
})

test("Returns File value as-is", t => {
  const file = new File(["Some text"], "file.txt", {type: "text/plain"})

  const fd = new FormData()

  fd.set("file", file)

  const actual = fd.get("file")

  t.true(actual instanceof File)
})

test(
  "Returns File when ReadStream passed with options.size argument",

  async t => {
    const fd = new FormData()

    const file = fs.createReadStream(filePath)

    const {size} = await fs.stat(filePath)

    fd.set("file", file, {size})

    t.true(fd.get("file") instanceof FileLike)
  }
)

test(
  "Returns File when Readable stream passed with options.size argument",

  t => {
    const fd = new FormData()

    const readalbe = new stream.Readable({
      read() {
        stream.push(null)
      }
    })

    fd.set("stream", readalbe, {size: 0})

    t.true(fd.get("stream") instanceof FileLike)
  }
)
