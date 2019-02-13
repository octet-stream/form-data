import {Readable} from "stream"
import path from "path"

import test from "ava"

import promiseFS from "promise-fs"

import FormData from "../../lib/FormData"

import read from "../__helper__/read"

const filePath = path.join(__dirname, "..", "..", "package.json")

test("Should return \"undefined\" on getting nonexistent field", t => {
  t.plan(1)

  const fd = new FormData()

  t.is(fd.get("nope"), undefined)
})

test("Should return a value of the existing field by given name", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("name", "John Doe")

  t.is(fd.get("name"), "John Doe")
})

test("Should return only the first value of the field", t => {
  t.plan(1)

  const fd = new FormData()

  fd.append("name", "John Doe")
  fd.append("name", "Max Doe")

  t.is(fd.get("name"), "John Doe")
})

test("Should return a stringified values", t => {
  t.plan(5)

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

test("Should return Readable stream as-is", async t => {
  t.plan(2)

  const expected = await promiseFS.readFile(filePath)

  const fd = new FormData()

  fd.set("stream", promiseFS.createReadStream(filePath))

  const actual = fd.get("stream")

  t.true(actual instanceof Readable)
  t.true((await read(actual)).equals(expected))
})

test("Should return Buffer value as-is", async t => {
  t.plan(2)

  const buffer = await promiseFS.readFile(filePath)

  const fd = new FormData()

  fd.set("buffer", buffer)

  const actual = fd.get("buffer")

  t.true(actual instanceof Buffer)
  t.true(actual.equals(buffer))
})
