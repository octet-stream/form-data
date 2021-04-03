import test from "ava"

import File from "./File"

test("Takes the name field taken from the second argument", t => {
  const expected = "file.txt"
  const file = new File(["Some content"], expected)

  t.is(file.name, expected)
})

test("Has the lastModified field", t => {
  const file = new File(["Some content"], "file.txt")

  t.is(typeof file.lastModified, "number")
})

test("Takes the lastModified value from options", t => {
  const expected = Date.now()
  const file = new File(["Some content"], "file.txt", {lastModified: expected})

  t.is(file.lastModified, expected)
})
