const {promises: fs, createReadStream} = require("fs")
const {join} = require("path")

const test = require("ava")

const FormData = require("../../lib/FormData")
const FileLike = require("../../lib/util/File")

const read = require("../__helper__/read")

const {readFile} = fs
const {isArray} = Array

const filePath = join(__dirname, "..", "..", "package.json")

test("Always returns an array, even if the FormData has no fields", t => {
  const fd = new FormData()

  t.true(isArray(fd.getAll("nope")))
})

test("Gets all values, coercing names to strings", t => {
  const fd = new FormData()

  fd.set("a", "a")
  t.deepEqual(fd.getAll("a"), ["a"])

  fd.set("1", "b")
  t.deepEqual(fd.getAll(1), ["b"])

  fd.set("false", "c")
  t.deepEqual(fd.getAll(false), ["c"])

  fd.set("null", "d")
  t.deepEqual(fd.getAll(null), ["d"])

  fd.set("undefined", "e")
  t.deepEqual(fd.getAll(undefined), ["e"])
})

test("Returns an array with the stringified primitive value", t => {
  const fd = new FormData()

  fd.set("number", 451)

  t.deepEqual(fd.getAll("number"), ["451"])
})

test("Returns an array with non-stringified Readable", t => {
  const fd = new FormData()

  const stream = createReadStream(filePath)

  fd.set("stream", stream)

  t.deepEqual(
    fd.getAll("stream"), [stream],
    "The Readable stream should be returned as-is."
  )
})

test("Returns an array with non-stringified Buffer", async t => {
  const fd = new FormData()

  const buffer = await readFile(filePath)

  fd.set("buffer", buffer)

  const [actual] = fd.getAll("buffer")

  t.true(actual instanceof FileLike)
  t.true((await read(actual.stream())).equals(buffer))
})
