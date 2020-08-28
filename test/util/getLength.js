const {Readable} = require("stream")

const {promises: fs, createReadStream} = require("fs")
const {ReadableStream} = require("web-streams-polyfill/ponyfill")

const test = require("ava")

const getLength = require("../../lib/util/getLength")

const {stat} = fs

test("Returns undefined for ReadableStream value", async t => {
  t.is(await getLength(new ReadableStream()), undefined)
})

test("Returns undefined for stream.Readable value", async t => {
  t.is(await getLength(new Readable({read() { }})), undefined)
})

test("Returns a length of given ReadStream value", async t => {
  const stream = createReadStream(__filename)

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
    constructor() {
      this.type = ""

      this.size = null
    }

    arrayBuffer() { }

    stream() { }
  }

  const blob = new Blob()

  t.is(await getLength(blob), blob.size)
})
