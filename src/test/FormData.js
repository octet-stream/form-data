import {createReadStream, readFile} from "promise-fs"

import test from "ava"

import req from "supertest"

import FormData from "../lib/FormData"

import read from "./__helper__/read"
import server from "./__helper__/server"

test("Should return \"undefined\" on getting nonexistent field", t => {
  t.plan(1)

  const fd = new FormData()

  t.is(fd.get("nope"), void 0)
})

test("Should delete field by it key", t => {
  t.plan(2)

  const fd = new FormData()

  fd.set("name", "value")

  t.true(fd.has("name"))

  fd.delete("name")

  t.false(fd.has("name"))
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

  t.deepEqual(body, {field})
})

test("Should correctly add a file to FormData request body", async t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("file", createReadStream("/usr/share/dict/words"))

  const file = await readFile("/usr/share/dict/words", "utf8")

  const data = await read(fd)

  const {body} = await req(server())
    .post("/")
    .set("content-type", `multipart/form-data; boundary=${fd.boundary}`)
    .send(data)

  t.deepEqual(body, {file})
})

test(
  "Should correctly add field AND file together to FormData request body",
  async t => {
    t.plan(1)

    const fd = new FormData()

    const field = "Hello, World!"

    fd.set("field", field)

    fd.set("file", createReadStream(__filename))

    const file = await readFile(__filename, "utf8")

    const data = await read(fd)

    const {body} = await req(server())
      .post("/")
      .set("content-type", `multipart/form-data; boundary=${fd.boundary}`)
      .send(data)

    t.deepEqual(body, {field, file})
  }
)
