import {createReadStream, readFile} from "promise-fs"

import test from "ava"

import req from "supertest"

import FormData from "../lib/FormData"

import read from "./__helper__/read"
import server from "./__helper__/server"

test("Should have iterator metohds", t => {
  t.plan(4)

  const fd = new FormData()

  t.true(typeof fd[Symbol.iterator] === "function")
  t.true(typeof fd.keys === "function")
  t.true(typeof fd.values === "function")
  t.true(typeof fd.entries === "function")
})

test("Should have all methods from the FormData specification", t => {
  t.plan(4)

  const fd = new FormData()

  // TODO: Don't forget to add a getAll method
  t.true(typeof fd.get === "function")
  t.true(typeof fd.set === "function")
  t.true(typeof fd.has === "function")
  // t.true(typeof fd.append === "function")
  t.true(typeof fd.delete === "function")
})

test("Should have a \"pipe\" method", t => {
  t.plan(1)

  const fd = new FormData()

  t.true(typeof fd.pipe === "function")
})

test("Should just add a primitive value", t => {
  t.plan(2)

  const fd = new FormData()

  fd.set("name", "value")

  t.true(fd.has("name"))
  t.is(fd.get("name"), "value")
})

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

test("Should correctly add a field with Buffer data", async t => {
  t.plan(1)

  const phrase = Buffer.from(
    "I've seen things you people wouldn't believe. " +
    "Attack ships on fire off the shoulder of Orion. " +
    "I watched C-beams glitter in the dark near the Tannhäuser Gate. " +
    "All those moments will be lost in time, like tears in rain. " +
    "Time to die."
  )

  const fd = new FormData()

  fd.set("field", phrase)

  const data = await read(fd)

  const {body} = await req(server())
    .post("/")
    .set("content-type", `multipart/form-data; boundary=${fd.boundary}`)
    .send(data)

  t.deepEqual(body, {
    field: String(phrase)
  })
})

test(
  "Should throw a TypeError on field setting when the name is not a string",
  t => {
    t.plan(3)

    const fd = new FormData()

    const trap = () => fd.set({})

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(err.message, "Field name should be a string. Received object")
  }
)

test(
  "Should throw a TypeError on field setting when the filename passed, " +
  "but it's not a string value.",
  t => {
    t.plan(3)

    const fd = new FormData()

    const trap = () => fd.set("key", "value", 451)

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(
      err.message, "Filename should be a string (if passed). Received number"
    )
  }
)
