import {promises as fs, createReadStream} from "fs"
import {join} from "path"

import test from "ava"

import FormData from "../../lib/FormData"
import FileLike from "../../lib/util/File"

import read from "../__helper__/read"

const {readFile} = fs
const {isArray} = Array

const filePath = join(__dirname, "..", "..", "package.json")

test("Always returns an array, even if the FormData have no fileds", t => {
  const fd = new FormData()

  t.true(isArray(fd.getAll("nope")))
})

test("Returns an array with the stringified primitive value", t => {
  const fd = new FormData()

  fd.set("number", 451)

  t.deepEqual(fd.getAll("number"), ["451"])
})

test("Return an array with non-stringified Readable", t => {
  const fd = new FormData()

  const stream = createReadStream(filePath)

  fd.set("stream", stream)

  t.deepEqual(
    fd.getAll("stream"), [stream],
    "The Readable stream should be returned as-is."
  )
})

test("Return an array with non-stringified Buffer", async t => {
  const fd = new FormData()

  const buffer = await readFile(filePath)

  fd.set("buffer", buffer)

  const [actual] = fd.getAll("buffer")

  t.true(actual instanceof FileLike)
  t.true((await read(actual.stream())).equals(buffer))
})
