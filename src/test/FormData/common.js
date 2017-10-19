import {Readable} from "stream"

import test from "ava"

import pq from "proxyquire"

import {spy} from "sinon"

import boundary from "../../lib/util/boundary"
import FormData from "../../lib/FormData"

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
