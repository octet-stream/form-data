import Blob from "fetch-blob"
import test from "ava"

import toFile from "../../lib/util/toFile"
import File from "../../lib/util/File"

test("Sets a File type from its name", t => {
  const buffer = Buffer.from("Some text")
  const file = toFile(buffer, "file.txt")

  t.is(file.type, "text/plain")
})

test("Creates a File from Buffer", t => {
  const buffer = Buffer.from("Some text")
  const file = toFile(buffer, "file.txt")

  t.true(file instanceof File)
})

test("Creates a File from Blob", t => {
  const buffer = new Blob(["Some text"], {type: "text/plain"})
  const file = toFile(buffer, "file.txt")

  t.true(file instanceof File)
})
