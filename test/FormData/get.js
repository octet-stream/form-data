const {Readable} = require("stream")
const {join} = require("path")

const test = require("ava")
const Blob = require("fetch-blob")

const {promises: fs, ReadStream, createReadStream} = require("fs")
const {ReadableStream} = require("web-streams-polyfill/ponyfill")

const FormData = require("../../lib/FormData")
const FileLike = require("../../lib/util/File")

const read = require("../__helper__/read")
const File = require("../__helper__/File")

const {stat, readFile} = fs

const filePath = join(__dirname, "..", "..", "package.json")

test("Returns \"null\" on getting nonexistent field", t => {
  const fd = new FormData()

  t.is(fd.get("nope"), null)
})

test("Returns values, coercing field names to strings", t => {
  const fd = new FormData()

  fd.set("a", "a")
  t.is(fd.get("a"), "a")

  fd.set("1", "b")
  t.is(fd.get(1), "b")

  fd.set("false", "c")
  t.is(fd.get(false), "c")

  fd.set("null", "d")
  t.is(fd.get(null), "d")

  fd.set("undefined", "e")
  t.is(fd.get(undefined), "e")
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

test("Returns Buffer value as File", async t => {
  const buffer = await readFile(filePath)

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

test("Returns File value", t => {
  const file = new File(["Some text"], "file.txt", {type: "text/plain"})

  const fd = new FormData()

  fd.set("file", file)

  const actual = fd.get("file")

  t.true(actual instanceof File)
})

test("Returns ReadStream stream as-is", async t => {
  const expected = await readFile(filePath)

  const fd = new FormData()

  fd.set("stream", createReadStream(filePath))

  const actual = fd.get("stream")

  t.true(actual instanceof ReadStream)
  t.true((await read(actual)).equals(expected))
})

test(
  "Returns ReadStream as a File when options.size argument is present",

  async t => {
    const fd = new FormData()

    const file = createReadStream(filePath)

    const {size} = await stat(filePath)

    fd.set("file", file, {size})

    t.true(fd.get("file") instanceof FileLike)
  }
)

test("Gets Readable stream as-is", t => {
  const fd = new FormData()

  const readable = new Readable({
    read() {
      readable.push(null)
    }
  })

  fd.set("stream", readable)

  t.true(fd.get("stream") instanceof Readable)
})

test("Gets File when ReadableStream as-is", t => {
  const readable = new ReadableStream({
    start(controller) {
      controller.close()
    }
  })

  const fd = new FormData()

  fd.set("stream", readable)

  t.true(fd.get("stream") instanceof ReadableStream)
})
