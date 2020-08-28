const {Readable} = require("stream")

const {createReadStream} = require("fs")

const test = require("ava")

const FormData = require("../../lib/FormData")
const read = require("../__helper__/read")

test("Returns a length of the empty FormData", async t => {
  const fd = new FormData()

  const actual = await fd.getComputedLength()

  t.is(actual, Buffer.byteLength(`--${fd.boundary}--\r\n\r\n`))
})

test("Returns undefined when FormData have Readable fields", async t => {
  const fd = new FormData()

  fd.set("field", "On Soviet Moon, landscape see binoculars through YOU.")
  fd.set("another", new Readable({read() { }}))

  const actual = await fd.getComputedLength()

  t.is(actual, undefined)
})

test(
  "Should correctly compute content length of the FormData with regular field",
  async t => {
    const fd = new FormData()

    fd.set("name", "Nyx")

    const actual = await fd.getComputedLength()
    const expected = await read(fd.stream).then(({length}) => length)

    t.is(actual, expected)
  }
)

test(
  "Should correctly compute content length of the FormData with Buffer",
  async t => {
    const fd = new FormData()

    fd.set("field", Buffer.from("Just another string"))

    const actual = await fd.getComputedLength()
    const expected = await read(fd.stream).then(({length}) => length)

    t.is(actual, expected)
  }
)

test(
  "Should correctly compute content length of the FormData with file",
  async t => {
    const fd = new FormData()

    fd.set("file", createReadStream(__filename))

    const actual = await fd.getComputedLength()
    const expected = await read(fd.stream).then(({length}) => length)

    t.is(actual, expected)
  }
)
