import test from "ava"

import {createReadStream} from "fs"
import {Readable} from "stream"
import {resolve} from "path"

import {ReadableStream} from "web-streams-polyfill"

import Blob from "fetch-blob"

import createServer from "./__helper__/mockServer"
import readStream from "./__helper__/readStream"
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

test("Allows ReadableStream as field's value", t => {
  const fd = new FormData()

  fd.set("stream", new ReadableStream())

  t.true(fd.get("stream") instanceof ReadableStream)
})

test("Allows Readable as field's value", t => {
  const fd = new FormData()

  fd.set("stream", new Readable({read() { }}))

  t.true(fd.get("stream") instanceof Readable)
})

test(".set() appends a string field", t => {
  const fd = new FormData()

  fd.set("field", "string")

  t.is(fd.get("field"), "string")
})

test(".set() replaces field if the new one has the same name", t => {
  const fd = new FormData()

  fd.set("field", "one")

  t.is(fd.get("field"), "one")

  fd.set("field", "two")

  t.is(fd.get("field"), "two")
})

test(".append() append a new field", t => {
  const fd = new FormData()

  fd.append("field", "string")

  t.is(fd.get("field"), "string")
})

test(".append() appends to and existent field", t => {
  const fd = new FormData()

  fd.append("field", "one")
  fd.append("field", "two")

  t.deepEqual(fd.getAll("field"), ["one", "two"])
})

test(".has() returns false for non-existent field", t => {
  const fd = new FormData()

  t.false(fd.has("field"))
})

test(".delete() removes a field", t => {
  const fd = new FormData()

  fd.set("field", "Some data")

  t.true(fd.has("field"))

  fd.delete("field")

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

test(".get() returns only first value from the field", t => {
  const fd = new FormData()

  fd.append("field", "one")
  fd.append("field", "two")

  t.is(fd.get("field"), "one")
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

test(
  ".getComputedLength() Returns a length of the empty FormData",
  async t => {
    const fd = new FormData()

    const actual = await fd.getComputedLength()

    t.is(actual, Buffer.byteLength(`--${fd.boundary}--\r\n\r\n`))
  }
)

test(
  ".getComputedLength() Returns undefined when FormData have Readable fields",
  async t => {
    const fd = new FormData()

    fd.set("field", "On Soviet Moon, landscape see binoculars through YOU.")
    fd.set("another", new Readable({ read() { } }))

    const actual = await fd.getComputedLength()

    t.is(actual, undefined)
  }
)

test(
  ".getComputedLength() returns the length of the FormData with regular field",
  async t => {
    const fd = new FormData()

    fd.set("name", "Nyx")

    const actual = await fd.getComputedLength()
    const expected = await readStream(fd.stream).then(({length}) => length)

    t.is(actual, expected)
  }
)

test(
  ".getComputedLength() returns the length of the FormData with Buffer",
  async t => {
    const fd = new FormData()

    fd.set("field", Buffer.from("Just another string"))

    const actual = await fd.getComputedLength()
    const expected = await readStream(fd.stream).then(({length}) => length)

    t.is(actual, expected)
  }
)

test(
  ".getComputedLength() returns the length of the FormData with File",

  async t => {
    const fd = new FormData()

    fd.set("file", createReadStream("readme.md"))

    const actual = await fd.getComputedLength()
    const expected = await readStream(fd.stream).then(({length}) => length)

    t.is(actual, expected)
  }
)

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

test("Sends a file content", async t => {
  const expected = "Some content"

  const req = createServer()
  const fd = new FormData()

  fd.set("file", new File([expected], "file.txt"))

  const {body} = await req
    .post("/")
    .set("content-type", fd.headers["Content-Type"])
    .send(await readStream(fd.stream, "utf-8"))

  t.is<string>(body.file as string, expected)
})

test("Sends field's content", async t => {
  const expected = "Some content"

  const req = createServer()
  const fd = new FormData()

  fd.set("field", expected)

  const { body } = await req
    .post("/")
    .set("content-type", fd.headers["Content-Type"])
    .send(await readStream(fd.stream, "utf-8"))

  t.is<string>(body.field as string, expected)
})

test("Reads file contents from a ReadStream", async t => {
  const filePath = resolve("readme.md")
  const expected = await readStream(createReadStream(filePath), "utf-8")

  const req = createServer()
  const fd = new FormData()

  fd.set("file", createReadStream(filePath))

  const {body} = await req
    .post("/")
    .set("content-type", fd.headers["Content-Type"])
    .send(await readStream(fd.stream, "utf-8"))

  t.is<string>(body.file as string, expected as string)
})

test(".values() is done on the first call when there's no data", t => {
  const fd = new FormData()

  const curr = fd.values().next()

  t.deepEqual(curr, {
    done: true,
    value: undefined
  })
})

test("Returns the first value on the first call", t => {
  const fd = new FormData()

  fd.set("first", "value")
  fd.set("second", 42)
  fd.set("third", [1, 2, 3])

  const curr = fd.values().next()

  t.deepEqual(curr, {
    done: false,
    value: "value"
  })
})

test(".toString() returns a proper string", t => {
  t.is(new FormData().toString(), "[object FormData]")
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
