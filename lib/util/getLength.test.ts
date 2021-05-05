import test from "ava"

import Blob from "fetch-blob"

import getLength from "./getLength"

const data = "My hovercraft is full of eels"

test("Returns 0 for empty input", t => {
  t.is(getLength(""), 0)
})

test("Returns legnth of the Buffer", t => {
  const buf = Buffer.from(data)

  t.is(getLength(buf), buf.length)
})

test("Returns length of the string input", t => {
  t.is(getLength(data), Buffer.from(data).length)
})

test("Returns length of the Blob", t => {
  const blob = new Blob([data], {type: "text/plain"})

  t.is(getLength(blob), blob.size)
})
