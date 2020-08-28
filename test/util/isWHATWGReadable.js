import {ReadableStream} from "web-streams-polyfill/ponyfill"

import test from "ava"

import isWHATWGReadable from "../../lib/util/isWHATWGReadable"

test("Returns true for ReadableStream instance", t => {
  t.true(isWHATWGReadable(new ReadableStream()))
})

test("Returns false for plain objects", t => {
  t.false(isWHATWGReadable({}))
})

test("Returns false for plain objects, but with the valid methods/props", t => {
  t.false(isWHATWGReadable({
    cancel() { },

    getReader() { },

    pipeTo() { },

    pipeThrough() { }
  }))
})
