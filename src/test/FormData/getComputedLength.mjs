import stream from "stream"
import fs from "fs"

import test from "ava"

import FormData from "../../lib/FormData"
import read from "../__helper__/readStreamWithAsyncIterator"

test("Should return 0 when FormData have no fields", async t => {
  const fd = new FormData()

  const actual = await fd.getComputedLength()

  t.is(actual, 0)
})

test("Should return 0 when FormData have stream.Readable fields", async t => {
  const fd = new FormData()

  fd.set("field", "On Soviet Moon, landscape see binoculars through YOU.")
  fd.set("another", new stream.Readable({read() { }}))

  const actual = await fd.getComputedLength()

  t.is(actual, 0)
})

test(
  "Should correctly compute content length of the FormData with regular field",
  async t => {
    const fd = new FormData()

    fd.set("name", "Nyx")

    const actual = await fd.getComputedLength()
    const expected = await read(fd).then(({length}) => length)

    t.is(actual, expected)
  }
)

test(
  "Should correctly compute content length of the FormData with Buffer",
  async t => {
    const fd = new FormData()

    fd.set("field", Buffer.from("Just another string"))

    const actual = await fd.getComputedLength()
    const expected = await read(fd).then(({length}) => length)

    t.is(actual, expected)
  }
)

test(
  "Should correctly compute content length of the FormData with file",
  async t => {
    const fd = new FormData()

    fd.set("file", fs.createReadStream("/usr/share/dict/words"))

    const actual = await fd.getComputedLength()
    const expected = await read(fd).then(({length}) => length)

    t.is(actual, expected)
  }
)
