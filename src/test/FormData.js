import {createReadStream} from "fs"

import test from "ava"

import FormData from "../lib/FormData"

import read from "./__helper__/read"

test("Should have iterator metohds", t => {
  t.plan(4)

  const fd = new FormData()

  t.true(typeof fd[Symbol.iterator] === "function")
  t.true(typeof fd.keys === "function")
  t.true(typeof fd.values === "function")
  t.true(typeof fd.entries === "function")
})

test("Should have all methods from the FormData specification", t => {
  t.plan(5)

  const fd = new FormData()

  // TODO: Don't forget to add a getAll method
  t.true(typeof fd.get === "function")
  t.true(typeof fd.set === "function")
  t.true(typeof fd.has === "function")
  t.true(typeof fd.append === "function")
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

test("Foo", async t => {
  const fd = new FormData()

  fd.set("name", createReadStream("/usr/share/dict/words"))

  // console.log((await read(fd)))

  await read(fd)

  t.pass()
})
