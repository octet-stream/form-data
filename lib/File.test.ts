import test from "ava"

import {File} from "./File"

test("Takes a filename as the second argument", t => {
  const expected = "file.txt"
  const file = new File(["Some content"], expected)

  t.is(file.name, expected)
})

test("The name property keeps its value after being reassigned", t => {
  const expected = "file.txt"
  const file = new File(["Some content"], expected)

  // @ts-expect-error
  t.notThrows(() => { file.name = "another-file.txt" })

  t.is(file.name, expected)
})

test("Has the lastModified field", t => {
  const file = new File(["Some content"], "file.txt")

  t.is(typeof file.lastModified, "number")
})

test("The lastModified property keeps its value after being reassigned", t => {
  const file = new File(["Some content"], "file.txt")

  const {lastModified: expected} = file

  // @ts-expect-error
  t.notThrows(() => { file.lastModified = Date.now() + 3000 })

  t.is(file.lastModified, expected)
})

test("Takes the lastModified value from options", t => {
  const expected = Date.now()
  const file = new File(["Some content"], "file.txt", {lastModified: expected})

  t.is(file.lastModified, expected)
})

test("Throws TypeError when constructed with less than 2 arguments", t => {
  // @ts-expect-error
  const trap = () => new File(["Some content"])

  t.throws(trap, {
    instanceOf: TypeError,
    message: "Failed to construct 'File': "
      + "2 arguments required, but only 1 present."
  })
})

test("Throws TypeError when constructed without arguments", t => {
  // @ts-expect-error
  const trap = () => new File()

  t.throws(trap, {
    instanceOf: TypeError,
    message: "Failed to construct 'File': "
      + "2 arguments required, but only 0 present."
  })
})
