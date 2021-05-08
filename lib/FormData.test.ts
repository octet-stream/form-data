import test from "ava"

import sinon from "sinon"

import {createReadStream, promises as fs} from "fs"
import {Readable} from "stream"
import {resolve} from "path"
import {inspect} from "util"

import Blob from "fetch-blob"

import readStream from "./__helper__/readStream"
import skip from "./__helper__/skipIterations"
import readLine from "./__helper__/readLine"

import {File} from "./File"

import {FormData, FormDataConstructorEntries} from "./FormData"

const {spy} = sinon
const {readFile} = fs

test("Has the boundary field", t => {
  const fd = new FormData()

  t.is(typeof fd.boundary, "string")
})

test("Has correct headers property", t => {
  const fd = new FormData()

  t.deepEqual(fd.headers, {
    "Content-Type": `multipart/form-data; boundary=${fd.boundary}`
  })
})

test("Has Readable stream property", t => {
  const fd = new FormData()

  t.true(fd.stream instanceof Readable)
})

test("Allows to append fields from constructor", t => {
  const expected: FormDataConstructorEntries = [
    {
      name: "field",
      value: "On Soviet Moon, landscape see binoculars through YOU"
    },
    {
      name: "file",
      value: new File(["My hovercraft is full of eels"], "hovercraft.txt")
    }
  ]

  const fd = new FormData(expected)

  t.true(fd.has("field"))
  t.true(fd.has("file"))
})

test("Creates a new File instance for given File", t => {
  const file = new File(["Some content"], "file.txt")
  const fd = new FormData()

  fd.set("file", file)

  t.not(fd.get("file"), file)
})

test("File created from Blob has proper default name", t => {
  const fd = new FormData()

  fd.set("file", new Blob(["Some content"]))

  t.is((fd.get("file") as File).name, "blob")
})

test("Assigns a filename argument to Blob field", t => {
  const expected = "some-file.txt"

  const blob = new Blob(["Some content"])
  const fd = new FormData()

  fd.set("file", blob, expected)

  t.is((fd.get("file") as File).name, expected)
})

test("User-defined filename has higher precedence", t => {
  const expected = "some-file.txt"

  const file = new File(["Some content"], "file.txt")
  const fd = new FormData()

  fd.set("file", file, expected)

  t.is((fd.get("file") as File).name, expected)
})

test("User-defined type has higher precedence", t => {
  const expected = "text/markdown"

  const file = new File(["Some content"], "file.txt", {type: "text/plain"})
  const fd = new FormData()

  fd.set("file", file, {type: expected})

  t.is((fd.get("file") as File).type, expected)
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

test(
  ".append() does nothing on existent field if it was created with .set()",
  t => {
    const fd = new FormData()

    fd.set("field", "one")
    fd.append("field", "two")

    t.is(fd.get("field"), "one")
  }
)

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
  t => {
    const fd = new FormData()

    const actual = fd.getComputedLength()

    t.is(actual, Buffer.byteLength(`--${fd.boundary}--\r\n\r\n`))
  }
)

test(
  ".getComputedLength() returns the length of the FormData with regular field",
  async t => {
    const fd = new FormData()

    fd.set("name", "Nyx")

    const actual = fd.getComputedLength()
    const expected = await readStream(fd).then(({length}) => length)

    t.is(actual, expected)
  }
)

test(
  ".getComputedLength() returns the length of the FormData with Buffer",
  async t => {
    const fd = new FormData()

    fd.set("field", Buffer.from("Just another string"))

    const actual = fd.getComputedLength()
    const expected = await readStream(fd).then(({length}) => length)

    t.is(actual, expected)
  }
)

test(
  ".getComputedLength() returns the length of the FormData with File",

  async t => {
    const fd = new FormData()

    fd.set("file", createReadStream("readme.md"))

    const actual = fd.getComputedLength()
    const expected = await readStream(fd).then(({length}) => length)

    t.is(actual, expected)
  }
)

test(".getAll() returns an empty array for non-existent field", t => {
  const fd = new FormData()

  t.deepEqual(fd.getAll("field"), [])
})

test(
  ".forEach() callback should not be called when FormData has no fields",
  t => {
    const fulfill = spy()

    const fd = new FormData()

    fd.forEach(fulfill)

    t.false(fulfill.called)
  }
)

test(
  ".forEach() callback should be called with the nullish context by default",
  t => {
    const fulfill = spy()

    const fd = new FormData()

    fd.set("name", "John Doe")

    fd.forEach(fulfill)

    t.is(fulfill.firstCall.thisValue, undefined)
  }
)

test(".forEach() callback should be called with the specified context", t => {
  const fulfill = spy()

  const ctx = new Map()

  const fd = new FormData()

  fd.set("name", "John Doe")

  fd.forEach(fulfill, ctx)

  t.true(fulfill.firstCall.thisValue instanceof Map)
  t.is(fulfill.firstCall.thisValue, ctx)
})

test(
  ".forEach() callback should be called with value, name and FormData itself",
  t => {
    const fulfill = spy()

    const fd = new FormData()

    fd.set("name", "John Doe")

    fd.forEach(fulfill)

    t.deepEqual(fulfill.firstCall.args, ["John Doe", "name", fd])
  }
)

test(".forEach() callback should be called once on each filed", t => {
  const fulfill = spy()

  const fd = new FormData()

  fd.set("first", "value")
  fd.set("second", 42)
  fd.set("third", [1, 2, 3])

  fd.forEach(fulfill)

  t.true(fulfill.calledThrice)
  t.deepEqual(fulfill.firstCall.args, ["value", "first", fd])
  t.deepEqual(fulfill.secondCall.args, ["42", "second", fd])
  t.deepEqual(fulfill.thirdCall.args, ["1,2,3", "third", fd])
})

test("Emits the footer for an empty content", async t => {
  const fd = new FormData()

  const iterable = readLine(Readable.from(fd))

  const {value} = await iterable.next()

  t.is(value, `--${fd.boundary}--`)
})

test("Has the boundary line when any data is present", async t => {
  const fd = new FormData()

  fd.set("field", "Some string")

  const iterable = readLine(Readable.from(fd))

  const {value} = await iterable.next()

  t.is(value, `--${fd.boundary}`)
})

test("Has correct field's header", async t => {
  const fd = new FormData()

  fd.set("field", "Some string")

  const iterable = await skip(readLine(Readable.from(fd)), 1)

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

  const iterable = await skip(readLine(Readable.from(fd)), 1)

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

  const iterable = await skip(readLine(Readable.from(fd)), 2)

  const {value} = await iterable.next()

  t.is(value, "Content-Type: text/plain")
})

test(
  "User-defined type has higher precedence in content-type header",
  async t => {
    const expected = "text/markdown"

    const file = new File(["Some content"], "file.txt")
    const fd = new FormData()

    fd.set("file", file, {type: expected})

    const iterable = await skip(readLine(Readable.from(fd)), 2)

    const {value} = await iterable.next()

    t.is(value, `Content-Type: ${expected}`)
  }
)

test("Encoder emits every appended field with proper data", async t => {
  const expectedDisposition = "Content-Disposition: form-data; name=\"field\""

  const fd = new FormData()

  fd.append("field", "Some string")
  fd.append("field", "Some other string")

  const iterable = readLine(Readable.from(fd))

  await skip(iterable, 1)

  const {value: firstFieldDisposition} = await iterable.next()

  t.is(firstFieldDisposition, expectedDisposition)

  await skip(iterable, 1)

  const {value: firstFieldContent} = await iterable.next()

  t.is(firstFieldContent, "Some string")

  await skip(iterable, 1)

  const {value: secondFieldDisposition} = await iterable.next()

  t.is(secondFieldDisposition, expectedDisposition)

  await skip(iterable, 1)

  const {value: secondFieldContent} = await iterable.next()

  t.is(secondFieldContent, "Some other string")
})

test("Encoder emits every appended file with proper data", async t => {
  const expectedDisposition = "Content-Disposition: form-data; name=\"file\""

  const fd = new FormData()

  fd.append("file", new File(["Some content"], "file.txt"))
  fd.append("file", new File(["Some **content**"], "file.md"))

  const iterable = readLine(Readable.from(fd))

  await skip(iterable, 1)

  const {value: firstFileDisposition} = await iterable.next()

  t.is(firstFileDisposition, `${expectedDisposition}; filename="file.txt"`)

  const {value: firstFileType} = await iterable.next()

  t.is(firstFileType, "Content-Type: text/plain")

  await skip(iterable, 1)

  const {value: firstFileContent} = await iterable.next()

  t.is(firstFileContent, "Some content")

  await skip(iterable, 1)

  const {value: secondFileDisposition} = await iterable.next()

  t.is(secondFileDisposition, `${expectedDisposition}; filename="file.md"`)

  const {value: secondFileType} = await iterable.next()

  t.is(secondFileType, "Content-Type: text/markdown")

  await skip(iterable, 1)

  const {value: secondFileContent} = await iterable.next()

  t.is(secondFileContent, "Some **content**")
})

test("Encoder emits file contents from a ReadStream", async t => {
  const filePath = resolve("readme.md")
  const expected = await readFile(filePath, "utf-8")

  const fd = new FormData()

  fd.set("file", createReadStream(filePath))

  const iterable = readLine(Readable.from(fd))

  await skip(iterable, 4)

  const chunks: string[] = []

  const footer = `--${fd.boundary}--`

  for await (const chunk of iterable) {
    if (chunk !== footer) {
      chunks.push(chunk)
    }
  }

  chunks.pop() // Remove trailing empty line

  t.is<string>(chunks.join("\n"), expected)
})

test(".values() is done on the first call when there's no data", t => {
  const fd = new FormData()

  const curr = fd.values().next()

  t.deepEqual(curr, {
    done: true,
    value: undefined
  })
})

test(".values() Returns the first value on the first call", t => {
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

test(".value() yields every value from FormData", t => {
  const fd = new FormData()

  fd.set("first", "value")
  fd.set("second", 42)
  fd.set("third", [1, 2, 3])

  t.deepEqual([...fd.values()], ["value", "42", "1,2,3"])
})

test(".keys() is done on the first call when there's no data", t => {
  const fd = new FormData()

  const curr = fd.keys().next()

  t.deepEqual(curr, {
    done: true,
    value: undefined
  })
})

test(".keys() Returns the first value on the first call", t => {
  const fd = new FormData()

  fd.set("first", "value")
  fd.set("second", 42)
  fd.set("third", [1, 2, 3])

  const curr = fd.keys().next()

  t.deepEqual(curr, {
    done: false,
    value: "first"
  })
})

test(".keys() yields every key from FormData", t => {
  const fd = new FormData()

  fd.set("first", "value")
  fd.set("second", 42)
  fd.set("third", [1, 2, 3])

  t.deepEqual([...fd.keys()], ["first", "second", "third"])
})

test(".toString() returns a proper string", t => {
  t.is(new FormData().toString(), "[object FormData]")
})

test("util.inspect() returns a proper string", t => {
  t.is<string>(inspect(new FormData()), "FormData")
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
        + "ReadStream | Buffer | File | Blob"
    })
  }
)

test(".append() throws TypeError when called with less than 2 arguments", t => {
  const fd = new FormData()

  // @ts-ignore
  const trap = () => fd.append("field")

  t.throws<TypeError>(trap, {
    instanceOf: TypeError,
    message: "Failed to execute 'append' on 'FormData': "
      + "2 arguments required, but only 1 present."
  })
})

test(
  ".append() throws TypeError when the filename argument is present, "
    + "but the value is not a File",

  t => {
    const fd = new FormData()

    const trap = () => fd.append("field", "Some value", "field.txt")

    t.throws<TypeError>(trap, {
      instanceOf: TypeError,
      message: "Failed to execute 'append' on 'FormData': "
        + "parameter 2 is not one of the following types: "
        + "ReadStream | Buffer | File | Blob"
    })
  }
)
