const test = require("ava")

const getType = require("../../lib/util/getType")

test("Should return a string with type name", t => {
  const res = getType({})

  t.is(typeof res, "string")
  t.is(res, "object")
})

test("Returns lowercased string for all basic types", t => {
  const boolean = getType(false)
  const nullType = getType(null)
  const undefType = getType(undefined)
  const string = getType("string")
  const number = getType(451)
  const array = getType([])
  const func = getType(() => {})
  const object = getType({})

  t.is(boolean, "boolean")
  t.is(nullType, "null")
  t.is(undefType, "undefined")
  t.is(string, "string")
  t.is(number, "number")
  t.is(array, "array")
  t.is(func, "function")
  t.is(object, "object")
})

test("returns non-basic types name as-is", t => {
  const genFn = getType(function* noop() { yield undefined })
  const map = getType(new Map())

  t.is(genFn, "GeneratorFunction")
  t.is(map, "Map")
})
