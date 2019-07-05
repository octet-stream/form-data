import test from "ava"

import FormData from "../../lib/FormData"

test("Appends a new value", t => {
  const fd = new FormData()

  fd.append("name", "value")

  t.deepEqual(
    fd.getAll("name"), ["value"],
    "Value should be returned as an array"
  )
})

test("Appends a value to the existing field", t => {
  const fd = new FormData()

  fd.append("names", "John")
  fd.append("names", "Max")

  t.deepEqual(fd.getAll("names"), ["John", "Max"])
})

test("Appends array values", t => {
  const fd = new FormData()

  fd.append("numbers", [4, 8, 15])
  fd.append("numbers", [16, 23, 42])

  t.deepEqual(fd.getAll("numbers"), [
    "4,8,15",
    "16,23,42"
  ])
})

test("Throws a TypeError when less than 2 arguments has been set", t => {
  const fd = new FormData()

  const trap = () => fd.append("name")

  const err = t.throws(trap)

  t.true(err instanceof TypeError)
  t.is(
    err.message,

    "Failed to execute 'append' on 'FormData': " +
    "2 arguments required, but only 1 present."
  )
})

test(
  "Throws a TypeError when a filename parameter" +
  "has been set for non-binary value type",
  t => {
    const fd = new FormData()

    const trap = () => fd.append("name", "Just a string", "file.txt")

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(
      err.message,

      "Failed to execute 'append' on 'FormData': " +
      "parameter 2 is not one of the following types: ",
      "ReadableStream | ReadStream | Readable | Buffer | File | Blob"
    )
  }
)
