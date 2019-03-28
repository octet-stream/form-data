import stream from "stream"

import test from "ava"

import pq from "proxyquire"
import req from "supertest"

import sinon from "sinon"
import {createReadStream, readFile} from "promise-fs"

import boundary from "../../lib/util/boundary"
import FormData from "../../lib/FormData"

import count from "../__helper__/count"
import read from "../__helper__/readStreamWithAsyncIterator"
import server from "../__helper__/server"

test("The stream accessor should return Readable stream", t => {
  t.plan(1)

  const fd = new FormData()

  t.true(fd.stream instanceof stream.Readable)
})

test("Boundary accessor should return a correct value", t => {
  t.plan(1)

  const spyondary = sinon.spy(boundary)

  const MockedFD = pq("../../lib/FormData", {
    "./util/boundary": {
      default: spyondary
    }
  }).default

  const fd = new MockedFD()

  const actual = fd.boundary

  t.is(actual, `NodeJSFormDataStream${spyondary.lastCall.returnValue}`)
})

test("Should return a correct headers", t => {
  t.plan(1)

  const spyondary = sinon.spy(boundary)

  const MockedFD = pq("../../lib/FormData", {
    "./util/boundary": {
      default: spyondary
    }
  }).default

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
  t.plan(1)

  const fd = new FormData()

  t.is(String(fd), "[object FormData]")
})

test("Should return a correct string on .inspect() call", t => {
  t.plan(1)

  const fd = new FormData()

  t.is(fd.inspect(), "FormData")
})

test("Should have no fields by default", t => {
  t.plan(1)

  const fd = new FormData()

  t.is(count(fd), 0)
})

test("Should add initial fields from a collection", t => {
  t.plan(3)

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
  t.plan(1)

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

  fd.set("file", createReadStream("/usr/share/dict/words"))

  const file = String(await readFile("/usr/share/dict/words"))

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
    t.plan(2)

    const fd = new FormData()

    const field = "Hello, World!"

    fd.set("field", field)

    fd.set("file", createReadStream("/usr/share/dict/words"))

    const expectedFile = await readFile("/usr/share/dict/words")

    const data = await read(fd)

    const res = await req(server())
      .post("/")
      .set("content-type", fd.headers["Content-Type"])
      .send(data)

    t.is(res.body.field, field)

    // I don't now why, but sometimes test fails here because file is empty -_-
    t.is(res.body.file, String(expectedFile))
  }
)
