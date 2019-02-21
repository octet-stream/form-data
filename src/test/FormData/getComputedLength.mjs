import stream from "stream"

import test from "ava"

import FormData from "../../lib/FormData"

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
