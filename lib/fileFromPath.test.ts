import test from "ava"

import {promises as fs} from "fs"
import {resolve, basename} from "path"

import readStream from "./__helper__/readStream"

import {File, FileOptions} from "./File"
import {fileFromPathSync} from "./fileFromPath"

const filePath = resolve("readme.md")

test("sync: Returns File instance", t => {
  t.true(fileFromPathSync(filePath) instanceof File)
})

test("sync: Creates a file from path", async t => {
  const expected: Buffer = await fs.readFile(filePath)

  const actual = await readStream(fileFromPathSync(filePath).stream())

  t.true((actual as Buffer).equals(expected))
})

test("sync: Has filename taken from file path", t => {
  const file = fileFromPathSync(filePath)

  t.is<string>(file.name, basename(filePath))
})

test("sync: Has lastModified field taken from file stats", async t => {
  const {mtimeMs} = await fs.stat(filePath)

  t.is<number>(fileFromPathSync(filePath).lastModified, mtimeMs)
})

test("sync: User-defined filename has higher precedence", t => {
  const expected = "some-file.txt"
  const file = fileFromPathSync(filePath, expected)

  t.is<string>(file.name, expected)
})

test("sync: User-defined lastModified has higher precedence", t => {
  const expected = Date.now()
  const file = fileFromPathSync(filePath, "some-file.txt", {
    lastModified: expected
  })

  t.is<number>(file.lastModified, expected)
})

test("Allows to set file options from second argument", t => {
  const expected: FileOptions = {lastModified: Date.now(), type: "text/plain"}

  const file = fileFromPathSync(filePath, expected)

  t.deepEqual<FileOptions>({
    lastModified: file.lastModified,
    type: file.type
  }, expected)
})
