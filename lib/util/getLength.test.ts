import test from "ava"

import Blob from "fetch-blob"

import getLength from "./getLength"

const data = "My hovercraft is full of eels"

test("Returns 0 for empty input", async t => {
  t.is(await getLength(""), 0)
})

test("Returns legnth of the Buffer", async t => {
  const buf = Buffer.from(data)

  t.is(await getLength(buf), buf.length)
})

test("Returns length of the string input", async t => {
  t.is(await getLength(data), Buffer.from(data).length)
})

test("Returns length of the Blob", async t => {
  const blob = new Blob([data], {type: "text/plain"})

  t.is(await getLength(blob), blob.size)
})
