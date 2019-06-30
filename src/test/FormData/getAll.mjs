import fs from "promise-fs"
import path from "path"

import test from "ava"

import FormData from "../../lib/FormData"

const isArray = Array.isArray

const filePath = path.join(__dirname, "..", "..", "package.json")

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

  const stream = fs.createReadStream(filePath)

  fd.set("stream", stream)

  t.deepEqual(
    fd.getAll("stream"), [stream],
    "The Readable stream should be returned as-is."
  )
})

test("Return an array with non-stringified Buffer", async t => {
  const fd = new FormData()

  const buffer = await fs.readFile(filePath)

  fd.set("buffer", buffer)

  const [actual] = fd.getAll("buffer")

  t.true(actual instanceof Buffer)
  t.true(actual.equals(buffer))
})
