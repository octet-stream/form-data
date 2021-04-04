import test from "ava"

import Blob from "fetch-blob"

import skip from "./__helper__/skipIterations"
import readLine from "./__helper__/readLine"

import File from "./File"

import FormData from "./FormData"

test("Has the boundary field", t => {
  const fd = new FormData()

  t.is(typeof fd.boundary, "string")
})

test("Has the Content-Type header with proper value", t => {
  const fd = new FormData()

  t.deepEqual(fd.headers, {
    "Content-Type": `multipart/form-data; boundary=${fd.boundary}`
  })
})

test("Creates a new File instance for given File", t => {
  const file = new File(["Some content"], "file.txt")
  const fd = new FormData()

  fd.set("file", file)

  t.not(fd.get("file"), file)
})

test("Assigns a filename argument to Blob field", t => {
  const expected = "some-file.txt"

  const blob = new Blob(["Some content"])
  const fd = new FormData()

  fd.set("file", blob, expected)

  t.is((fd.get("file") as File).name, expected)
})

test("User-defined filename has higher precedence for File", t => {
  const expected = "some-file.txt"

  const file = new File(["Some content"], "file.txt")
  const fd = new FormData()

  fd.set("file", file, expected)

  t.is((fd.get("file") as File).name, expected)
})

test("Allows filename argument to be set from options", t => {
  const expected = "some-file.txt"

  const blob = new Blob(["Some content"])

  const fd = new FormData()

  fd.set("file", blob, {filename: expected})

  t.is((fd.get("file") as File).name, expected)
})

test(".set() appends a string field", t => {
  const fd = new FormData()

  fd.set("field", "string")

  t.is(fd.get("field"), "string")
})

test(".has() returns false for non-existent field", t => {
  const fd = new FormData()

  t.false(fd.has("field"))
})

test(".get() returns null for non-existent field", t => {
  const fd = new FormData()

  t.is(fd.get("field"), null)
})

test(".get() returns number values as string", t => {
  const fd = new FormData()

  fd.set("field", 42)

  t.is(fd.get("field"), "42")
})

test(".get() returns Blob as a File", t => {
  const blob = new Blob(["Some text"])
  const fd = new FormData()

  fd.set("blob", blob)

  t.true(fd.get("blob") instanceof File)
})

test(".get() returns Buffer as a File", t => {
  const buffer = Buffer.from("Some text")
  const fd = new FormData()

  fd.set("buffer", buffer)

  t.true(fd.get("buffer") instanceof File)
})

test(".get() returns File as-is", t => {
  const file = new File(["Some text"], "file.txt")
  const fd = new FormData()

  fd.set("file", file)

  t.true(fd.get("file") instanceof File)
})

test(".getAll() returns an empty array for non-existent field", t => {
  const fd = new FormData()

  t.deepEqual(fd.getAll("field"), [])
})

test("Emits the footer for an empty content", async t => {
  const fd = new FormData()

  const iterable = readLine(fd.stream)

  const {value} = await iterable.next()

  t.is(value, `--${fd.boundary}--`)
})

test("Has the boundary line when any data is present", async t => {
  const fd = new FormData()

  fd.set("field", "Some string")

  const iterable = readLine(fd.stream)

  const {value} = await iterable.next()

  t.is(value, `--${fd.boundary}`)
})

test("Has correct field's header", async t => {
  const fd = new FormData()

  fd.set("field", "Some string")

  const iterable = await skip(readLine(fd.stream), 1)

  const {value} = await iterable.next()

  t.is(
    value,
    "Content-Disposition: form-data; name=\"field\"",

    "Header MUST have both content-dispositions and field's name."
  )
})

test("Has correct File's header", async t => {
  const file = new File(["Some content"], "file.txt")
  const fd = new FormData()

  fd.set("file", file)

  const iterable = await skip(readLine(fd.stream), 1)

  const {value} = await iterable.next()

  t.is(
    value,
    "Content-Disposition: form-data; name=\"file\"; filename=\"file.txt\""
  )
})

test("Takes content-type from the filename", async t => {
  const file = new File(["Some content"], "file.txt")
  const fd = new FormData()

  fd.set("file", file)

  const iterable = await skip(readLine(fd.stream), 2)

  const {value} = await iterable.next()

  t.is(value, "Content-Type: text/plain")
})

test(".set() throws TypeError when called with less than 2 arguments", t => {
  const fd = new FormData()

  // @ts-ignore
  const trap = () => fd.set("field")

  t.throws<TypeError>(trap, {
    instanceOf: TypeError,
    message: "Failed to execute 'set' on 'FormData': "
      + "2 arguments required, but only 1 present."
  })
})

test(
  ".set() throws TypeError when the filename argument is present, "
    + "but the value is not a File",

  t => {
    const fd = new FormData()

    const trap = () => fd.set("field", "Some value", "field.txt")

    t.throws<TypeError>(trap, {
      instanceOf: TypeError,
      message: "Failed to execute 'set' on 'FormData': "
        + "parameter 2 is not one of the following types: "
        + "ReadableStream | ReadStream | Readable | Buffer | File | Blob"
    })
  }
)
