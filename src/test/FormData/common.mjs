import stream from "stream"

import test from "ava"
import pq from "proxyquire"
import Blob from "fetch-blob"
import req from "supertest"
import fs from "promise-fs"
import sinon from "sinon"

import boundary from "../../lib/util/boundary"
import FormData from "../../lib/FormData"

import File from "../__helper__/File"
import count from "../__helper__/count"
import server from "../__helper__/server"
import read from "../__helper__/readStreamWithAsyncIterator"

test("The stream accessor should return Readable stream", t => {
  const fd = new FormData()

  t.true(fd.stream instanceof stream.Readable)
})

test("Boundary accessor should return a correct value", t => {
  const spyondary = sinon.spy(boundary)

  const MockedFD = pq("../../lib/FormData", {
    "./util/boundary": spyondary
  })

  const fd = new MockedFD()

  const actual = fd.boundary

  t.is(actual, `NodeJSFormDataStream${spyondary.lastCall.returnValue}`)
})

test("Should return a correct headers", t => {
  const spyondary = sinon.spy(boundary)

  const MockedFD = pq("../../lib/FormData", {
    "./util/boundary": spyondary
  })

  const fd = new MockedFD()

  const actual = fd.headers

  const expected = {
    "Content-Type": (
      "multipart/form-data; boundary=" +
      `NodeJSFormDataStream${spyondary.lastCall.returnValue}`
    )
  }

  t.deepEqual(actual, expected)
})

test("Should return a correct string on .toString() convertation", t => {
  const fd = new FormData()

  t.is(String(fd), "[object FormData]")
})

test("Should return a correct string on .inspect() call", t => {
  const fd = new FormData()

  t.is(fd.inspect(), "FormData")
})

test("Should have no fields by default", t => {
  const fd = new FormData()

  t.is(count(fd), 0)
})

test("Should add initial fields from a collection", t => {
  const fields = [
    {
      name: "nick",
      value: "Rarara"
    },
    {
      name: "eyes",
      value: "blue"
    }
  ]

  const fd = new FormData(fields)

  t.is(count(fd), 2)
  t.is(fd.get("nick"), "Rarara")
  t.is(fd.get("eyes"), "blue")
})

test("Should ignore invalid initial fields", t => {
  const fields = [
    {
      name: "nick",
      value: "Rarara"
    },
    null,
    ["some array field"],
    {
      name: "eyes",
      value: "blue"
    }
  ]

  const fd = new FormData(fields)

  t.is(count(fd), 2)
  t.is(fd.get("nick"), "Rarara")
  t.is(fd.get("eyes"), "blue")
})

test("Should correctly add a filed to FormData request body", async t => {
  const fd = new FormData()

  const field = "Hello, World!"

  fd.set("field", field)

  const data = await read(fd)

  const {body} = await req(server())
    .post("/")
    .set("content-type", `multipart/form-data; boundary=${fd.boundary}`)
    .send(data)

  t.is(body.field, field)
})

test("Should correctly add a file to FormData request body", async t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("file", fs.createReadStream("/usr/share/dict/words"))

  const file = await fs.readFile("/usr/share/dict/words", "utf-8")

  const data = await read(fd)

  const {body} = await req(server())
    .post("/")
    .set("content-type", `multipart/form-data; boundary=${fd.boundary}`)
    .send(data)

  t.is(body.file, String(file))
})

test(
  "Should correctly add field AND file together to FormData request body",
  async t => {
    const fd = new FormData()

    const field = "Hello, World!"

    fd.set("field", field)

    fd.set("file", fs.createReadStream("/usr/share/dict/words"))

    const expectedFile = await fs.readFile("/usr/share/dict/words")

    const data = await read(fd)

    const res = await req(server())
      .post("/")
      .set("content-type", fd.headers["Content-Type"])
      .send(data)

    t.is(res.body.field, field)

    // I don't know why, but sometimes test fails here because file is empty -_-
    t.is(res.body.file, String(expectedFile))
  }
)

test("Correctly send Blob fields", async t => {
  const fd = new FormData()

  const expected = "Some text"

  fd.set("blob", new Blob([expected], {type: "text/plain"}), "file.txt")

  const {body} = await req(server())
    .post("/")
    .set("content-type", fd.headers["Content-Type"])
    .send(await read(fd))

  t.is(body.blob, expected)
})
