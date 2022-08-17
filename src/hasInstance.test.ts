import test from "ava"

import {Blob} from "./Blob.js"
import {File} from "./File.js"

test("Blob object is recognized as Blob", t => {
  const blob = new Blob()

  t.true(blob instanceof Blob)
})

test("Blob object is not recognized as File", t => {
  const blob = new Blob()

  t.false(blob instanceof File)
})

test("Blob-ish object is recognized as Blob", t => {
  const blob = {
    [Symbol.toStringTag]: "Blob",
    stream() { }
  }

  t.true(blob instanceof Blob)
})

test(
  "Blob-ish objects with only arrayBuffer method is recognized as Blob",

  t => {
    const blobAlike = {
      arrayBuffer() { },
      [Symbol.toStringTag]: "Blob"
    }

    t.true(blobAlike instanceof Blob)
  }
)

test("Blob-ish object is not recognized as File", t => {
  const blob = {
    [Symbol.toStringTag]: "Blob",
    stream() { }
  }

  t.false(blob instanceof File)
})

test(
  "Blob-ish objects with only arrayBuffer method is not recognized as File",

  t => {
    const blobAlike = {
      arrayBuffer() { },
      [Symbol.toStringTag]: "Blob"
    }

    t.false(blobAlike instanceof File)
  }
)

test("File is recognized as Blob instance", t => {
  const file = new File([], "file.txt")

  t.true(file instanceof Blob)
})

test("File is recognized as File instance", t => {
  const file = new File([], "file.txt")

  t.true(file instanceof File)
})

test("File-ish object is recognized as Blob", t => {
  const file = {
    name: "",
    [Symbol.toStringTag]: "File",
    stream() { }
  }

  t.true(file instanceof Blob)
})

test("File-ish object is recognized as File", t => {
  const file = {
    name: "",
    [Symbol.toStringTag]: "File",
    stream() { }
  }

  t.true(file instanceof File)
})
