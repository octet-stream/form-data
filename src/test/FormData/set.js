import {createReadStream} from "fs"
import {Readable} from "stream"

import test from "ava"

import FormData from "../../lib/FormData"

test("Should set a primitive value", t => {
  t.plan(4)

  const fd = new FormData()

  fd.set("null", null)
  fd.set("number", 3310)
  fd.set("string", "string")
  fd.set("undefined", void 0)

  // All returned values should be stringified by String() call
  t.is(fd.get("null"), "null")
  t.is(fd.get("number"), "3310")
  t.is(fd.get("string"), "string")
  t.is(fd.get("undefined"), "undefined")
})

test("Should set an array value", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("array", ["earth pony", "unicorn", "pegasus"])

  t.is(
    fd.get("array"), "earth pony,unicorn,pegasus",
    "Value should be a stringified array."
  )
})

test("Should add an object", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("object", {
    name: "John Doe"
  })

  t.is(
    fd.get("object"), "[object Object]",
    "Value should be just a stringified object"
  )
})

test("Should replace an existing field", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("name", "John")

  fd.set("name", "Max")

  t.is(fd.get("name"), "Max")
})

test("Should not allow to .append() new value to an existing key", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("name", "John")

  fd.append("name", "Max")

  t.deepEqual(fd.getAll("name"), ["John"])
})

test("Should set a Readable stream", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("stream", createReadStream(__filename))

  t.true(fd.get("stream") instanceof Readable)
})
