import test from "ava"

import {promises as fs} from "fs"
import {resolve, basename} from "path"

import {File, FileOptions} from "./File"
import {fileFromPathSync, fileFromPath} from "./fileFromPath"

import sleep from "./__helper__/sleep"

const filePath = resolve("license")

test("Returns File instance", async t => {
  t.true(await fileFromPath(filePath) instanceof File)
})

test("sync: Returns File instance", t => {
  t.true(fileFromPathSync(filePath) instanceof File)
})

test("Creates a file from path", async t => {
  const expected: Buffer = await fs.readFile(filePath)

  const file = await fileFromPath(filePath)

  const actual = Buffer.from(await file.arrayBuffer())

  t.true(actual.equals(expected))
})

test("sync: Creates a file from path", async t => {
  const expected: Buffer = await fs.readFile(filePath)
  const file = fileFromPathSync(filePath)

  const actual = Buffer.from(await file.arrayBuffer())

  t.true(actual.equals(expected))
})

test("Has name taken from file path", async t => {
  const file = await fileFromPath(filePath)

  t.is<string>(file.name, basename(filePath))
})

test("Has an empty string as file type by default", async t => {
  const file = await fileFromPath("readme.md")

  t.is<string>(file.type, "")
})

test("Has lastModified field taken from file stats", async t => {
  const {mtimeMs} = await fs.stat(filePath)

  const file = await fileFromPath(filePath)

  t.is<number>(file.lastModified, mtimeMs)
})

test("Has the size property reflecting the one of the actual file", async t => {
  const {size} = await fs.stat(filePath)

  const file = await fileFromPath(filePath)

  t.is<number>(file.size, size)
})

test("Allows to set file name as the second argument", async t => {
  const expected = "some-file.txt"

  const file = await fileFromPath(filePath, expected)

  t.is<string>(file.name, expected)
})

test("sync: Allows to set file name as the second argument", t => {
  const expected = "some-file.txt"
  const file = fileFromPathSync(filePath, expected)

  t.is<string>(file.name, expected)
})

test("User-defined lastModified has higher precedence", async t => {
  const expected = Date.now()

  const file = await fileFromPath(filePath, {lastModified: expected})

  t.is<number>(file.lastModified, expected)
})

test("Allows to set file options from second argument", async t => {
  const expected: FileOptions = {lastModified: Date.now(), type: "text/plain"}

  const file = await fileFromPath(filePath, expected)

  t.deepEqual<FileOptions>({
    lastModified: file.lastModified,
    type: file.type
  }, expected)
})

test("sync: Allows to set file options from second argument", t => {
  const expected: FileOptions = {lastModified: Date.now(), type: "text/plain"}

  const file = fileFromPathSync(filePath, expected)

  t.deepEqual<FileOptions>({
    lastModified: file.lastModified,
    type: file.type
  }, expected)
})

test("Can be read as text", async t => {
  const expected = await fs.readFile(filePath, "utf-8")
  const file = await fileFromPath(filePath)

  const actual = await file.text()

  t.is<string>(actual, expected)
})

test("Can be read as ArrayBuffer", async t => {
  const expected = await fs.readFile(filePath)
  const file = await fileFromPath(filePath)

  const actual = await file.arrayBuffer()

  t.true(actual instanceof ArrayBuffer, "The result must be an ArrayBuffer")
  t.true(Buffer.from(actual).equals(expected))
})

test("Can be sliced", async t => {
  const file = await fileFromPath(filePath)

  const actual = await file.slice(0, 15).text()

  t.is<string>(actual, "The MIT License")
})

test("Can be sliced from the arbitrary start", async t => {
  const file = await fileFromPath(filePath)

  const actual = await file.slice(4, 15).text()

  t.is<string>(actual, "MIT License")
})

test("Reads from empty file", async t => {
  const file = await fileFromPath(filePath)

  const sliced = file.slice(0, 0)

  t.is<number>(sliced.size, 0, "Must have 0 size")
  t.is<string>(await sliced.text(), "", "Must return empty string")
})

test("Fails attempt to read modified file", async t => {
  const path = resolve("readme.md")
  const file = await fileFromPath(path)

  await sleep(100) // wait 100ms

  const now = new Date()

  await fs.utimes(path, now, now)

  await t.throwsAsync(() => file.text(), {
    name: "NotReadableError",
    message: "The requested file could not be read, "
      + "typically due to permission problems that have occurred "
      + "after a reference to a file was acquired."
  })
})
