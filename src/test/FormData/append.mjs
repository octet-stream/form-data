import test from "ava"

import FormData from "../../lib/FormData"

test("Should set a new value", t => {
  const fd = new FormData()

  fd.append("name", "value")

  t.deepEqual(
    fd.getAll("name"), ["value"],
    "Value should be returned as an array"
  )
})

test("Should append a value to the existing filed", t => {
  const fd = new FormData()

  fd.append("names", "John")
  fd.append("names", "Max")

  t.deepEqual(fd.getAll("names"), ["John", "Max"])
})

test("Should append array values", t => {
  const fd = new FormData()

  fd.append("numbers", [4, 8, 15])
  fd.append("numbers", [16, 23, 42])

  t.deepEqual(fd.getAll("numbers"), [
    "4,8,15",
    "16,23,42"
  ])
})
