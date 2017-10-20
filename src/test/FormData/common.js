import {Readable} from "stream"

import test from "ava"

import pq from "proxyquire"

import {spy} from "sinon"

import boundary from "../../lib/util/boundary"
import FormData from "../../lib/FormData"

import count from "../__helper__/count"

test("The stream accessor should return Readable stream", t => {
  t.plan(1)

  const fd = new FormData()

  t.true(fd.stream instanceof Readable)
})

test("Boundary accessor should return a correct string", t => {
  t.plan(1)

  const spyondary = spy(boundary)

  const MockedFD = pq("../../lib/FormData", {
    "./util/boundary": {
      default: spyondary
    }
  }).default

  const fd = new MockedFD()

  const actual = fd.boundary

  t.is(actual, `NodeJSFormDataStream${spyondary.lastCall.returnValue}`)
})

test("Should return a correct string on .toString() convertation", t => {
  t.plan(1)

  const fd = new FormData()

  t.is(String(fd), "[object FormData]")
})

test("Should return a correct string on .toJSON() convertation", t => {
  t.plan(1)

  const fd = new FormData()

  t.is(JSON.stringify({fd}), "{\"fd\":\"[object FormData]\"}")
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

test("Should add initial fields from an array", t => {
  t.plan(3)

  const fields = [
    ["nick", "Rarara"],
    ["eyes", "blue"]
  ]

  const fd = new FormData(fields)

  t.is(count(fd), 2)
  t.is(fd.get("nick"), "Rarara")
  t.is(fd.get("eyes"), "blue")
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
