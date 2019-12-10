import {Readable} from "stream"

import {promises as fs, createReadStream} from "fs"
import {ReadableStream} from "web-streams-polyfill/ponyfill"

import test from "ava"

import getLength from "../../lib/util/getLength"

const {stat} = fs

test("Returns undefined for ReadableStream value", async t => {
  t.is(await getLength(new ReadableStream()), undefined)
})

test("Returns undefined for stream.Readable value", async t => {
  t.is(await getLength(new Readable({read() { }})), undefined)
})

test("Returns a length of given ReadStream value", async t => {
  const stream = createReadStream("/usr/share/dict/words")

  const expected = await stat(stream.path).then(({size}) => size)
  const actual = await getLength(stream)

  t.is(actual, expected)
})

test("Returns a length of given Buffer", async t => {
  const buffer = Buffer.from("My hovercraft is full of eels")

  t.is(await getLength(buffer), buffer.length)
})

test("Returns a length of given string value", async t => {
  const string = "My hovercraft is full of eels"

  t.is(await getLength(string), Buffer.from(string).length)
})

test("Returns a length of given Blob value", async t => {
  class Blob {
    type = ""

    size = 451

    arrayBuffer() { }

    stream() { }
  }

  const blob = new Blob()

  t.is(await getLength(blob), blob.size)
})
