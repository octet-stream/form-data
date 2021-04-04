import test from "ava"

import {resolve} from "path"
import {createReadStream} from "fs"
import {Readable} from "stream"

import {ReadableStream} from "web-streams-polyfill"

import Blob from "fetch-blob"

import {File} from "../File"

import getFilename from "./getFilename"

const filePath = resolve("readme.md")

test("Returns default filename for Blob", t => {
  const blob = new Blob(["Some content"])

  t.is(getFilename(blob), "blob")
})

test("Returns default filename for ReadableStream", t => {
  t.is(getFilename(new ReadableStream()), "blob")
})

test("Returns default filename for Readable", t => {
  t.is(getFilename(new Readable({read() { }})), "blob")
})

test("Returns a filename for File", t => {
  const expected = "file.txt"

  const file = new File(["Some content"], expected)

  t.is(getFilename(file), expected)
})

test("Returns a filename for ReadStream", t => {
  t.is(getFilename(createReadStream(filePath)), filePath)
})
