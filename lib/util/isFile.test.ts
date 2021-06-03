import test from "ava"

import {createReadStream} from "fs"

import {File, Blob, FileLike} from "../File"

import isFile from "./isFile"

test("Returns true for a File", t => {
  const file = new File(["Some content"], "file.txt")

  t.true(isFile(file))
})

test("Returns true for Blob", t => {
  const blob = new Blob(["Some contnt"])

  t.true(isFile(blob))
})

test("Returns true for file-ish object", t => {
  class MyFile implements FileLike {
    name!: string

    size!: number

    lastModified!: number

    async* stream(): AsyncGenerator<Uint8Array> {
      yield new Uint8Array()
    }

    get [Symbol.toStringTag](): string {
      return "File"
    }
  }

  t.true(isFile(new MyFile()))
})

test("Returns false for null", t => {
  t.false(isFile(null))
})

test("Returns false for undefined", t => {
  t.false(isFile(undefined))
})

test("Returns false for ReadStream", t => {
  const file = createReadStream("readme.md")

  t.false(isFile(file))
})
