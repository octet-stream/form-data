import test from "ava"

import {resolve} from "path"
import {promises as fs, createReadStream} from "fs"

import Blob from "fetch-blob"

import getLength from "./getLength"

const filePath = resolve("readme.md")
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

test("Returns length of the ReadStream", async t => {
  const expected = await fs.stat(filePath).then(({size}) => size)

  t.is(await getLength(createReadStream(filePath)), expected)
})
