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

test("Should delete field by it key", t => {
  t.plan(2)

  const fd = new FormData()

  fd.set("name", "value")

  t.true(fd.has("name"))

  fd.delete("name")

  t.false(fd.has("name"))
})

test("Should correctly add field AND file together", async t => {
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
})
