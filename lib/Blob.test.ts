import test from "ava"

import {Blob} from "./Blob"

test("Constructor creates a new Blob when called without arguments", t => {
  const blob = new Blob()

  t.true(blob instanceof Blob)
})

test("Empty Blob returned by Blob constructor has the size of 0", t => {
  const blob = new Blob()

  t.is(blob.size, 0)
})

test("Blob type is an empty string by default", t => {
  const blob = new Blob()

  t.is(blob.type, "")
})

test(
  "Constructor throws an error when first argument is not an object",

  t => {
    const rounds = [null, true, false, 0, 1, 1.5, "FAIL"]

    rounds.forEach(round => {
      // @ts-expect-error
      const trap = () => new Blob(round)

      t.throws(trap, {
        instanceOf: TypeError,
        message: "Failed to construct 'Blob': "
          + "The provided value cannot be converted to a sequence."
      })
    })
  }
)

test(
  "Constructor throws an error when first argument is not an iterable object",

  t => {
    const rounds = [new Date(), new RegExp(""), {}, {0: "FAIL", length: 1}]

    rounds.forEach(round => {
      // @ts-expect-error
      const trap = () => new Blob(round)

      t.throws(trap, {
        instanceOf: TypeError,
        message: "Failed to construct 'Blob': "
          + "The object must have a callable @@iterator property."
      })
    })
  }
)

test("Creates a new Blob from an array of strings", async t => {
  const source = ["one", "two", "three"]
  const blob = new Blob(source)

  t.is(await blob.text(), source.join(""))
})
