import test from "ava"

import {ReadableStream} from "web-streams-polyfill"

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

test("Creates a new Blob from an array of Uint8Array", async t => {
  const encoder = new TextEncoder()
  const source = ["one", "two", "three"]

  const blob = new Blob(source.map(part => encoder.encode(part)))

  t.is(await blob.text(), source.join(""))
})

test("Creates a new Blob from an array of ArrayBuffer", async t => {
  const encoder = new TextEncoder()
  const source = ["one", "two", "three"]

  const blob = new Blob(source.map(part => encoder.encode(part).buffer))

  t.is(await blob.text(), source.join(""))
})

test("Creates a new Blob from an array of Blob", async t => {
  const source = ["one", "two", "three"]

  const blob = new Blob(source.map(part => new Blob([part])))

  t.is(await blob.text(), source.join(""))
})

test("Accepts a String object as a sequence", async t => {
  const expected = "abc"

  // eslint-disable-next-line no-new-wrappers
  const blob = new Blob(new String(expected))

  t.is(await blob.text(), expected)
})

test("Accepts Uint8Array as a sequence", async t => {
  const expected = [1, 2, 3]
  const blob = new Blob(new Uint8Array(expected))

  t.is(await blob.text(), expected.join(""))
})

test("Accepts iterable object as a sequence", async t => {
  const blob = new Blob({[Symbol.iterator]: Array.prototype[Symbol.iterator]})

  t.is(blob.size, 0)
  t.is(await blob.text(), "")
})

test("Constructor reads blobParts from iterable object", async t => {
  const source = ["one", "two", "three"]
  const expected = source.join("")

  const blob = new Blob({
    * [Symbol.iterator]() {
      yield* source
    }
  })

  t.is(blob.size, new TextEncoder().encode(expected).byteLength)
  t.is(await blob.text(), expected)
})

test("Blob has the size measured from the blobParts", t => {
  const source = ["one", "two", "three"]
  const expected = new TextEncoder().encode(source.join("")).byteLength

  const blob = new Blob(source)

  t.is(blob.size, expected)
})

test("Accepts type for Blob as an option in the second argument", t => {
  const expected = "text/markdown"

  const blob = new Blob(["Some *Markdown* content"], {type: expected})

  t.is(blob.type, expected)
})

test("Casts elements of the blobPart array to a string", async t => {
  const source: unknown[] = [
    null,
    undefined,
    true,
    false,
    0,
    1,

    // eslint-disable-next-line no-new-wrappers
    new String("string object"),

    [],
    {0: "FAIL", length: 1},
    {toString() { return "stringA" }},
    {toString: undefined, valueOf() { return "stringB" }},
  ]

  const expected = source.map(element => String(element)).join("")

  const blob = new Blob(source)

  t.is(await blob.text(), expected)
})

test("undefined value has no affect on property bag argument", t => {
  const blob = new Blob([], undefined)

  t.is(blob.type, "")
})

test("null value has no affect on property bag argument", t => {
  const blob = new Blob([], null)

  t.is(blob.type, "")
})

test("Invalid type in property bag will result in an empty string", t => {
  const blob = new Blob([], {type: "\u001Ftext/plain"})

  t.is(blob.type, "")
})

test(
  "Throws an error if invalid property bag passed",

  t => {
    const rounds = [
      123,
      123.4,
      true,
      false,
      "FAIL"
    ]

    rounds.forEach(round => {
      // @ts-expect-error
      const trap = () => new Blob([], round)

      t.throws(trap, {
        instanceOf: TypeError,
        message: "Failed to construct 'Blob': "
          + "parameter 2 cannot convert to dictionary."
      })
    })
  }
)

test("Blob-like objects must be recognized as Blob in instanceof test", t => {
  class BlobAlike {
    type = ""

    size = 0

    stream() {
      return new ReadableStream()
    }

    arrayBuffer() {
      return new ArrayBuffer(0)
    }

    [Symbol.toStringTag] = "Blob"
  }

  const blob = new BlobAlike()

  t.true(blob instanceof Blob)
})

test("Blob-shaped objects must be recognized as Blob in instanceof test", t => {
  const blobAlike = {
    type: "",
    size: 0,

    stream() {
      return new ReadableStream()
    },

    arrayBuffer() {
      return new ArrayBuffer(0)
    },

    [Symbol.toStringTag]: "Blob"
  }

  t.true(blobAlike instanceof Blob)
})

test(
  "Blob-like objects with only arrayBuffer method must be recognized as Blob",

  t => {
    const blobAlike = {
      type: "",
      size: 0,

      arrayBuffer() {
        return new ArrayBuffer(0)
      },

      [Symbol.toStringTag]: "Blob"
    }

    t.true(blobAlike instanceof Blob)
  }
)

test(".slice() a new blob when called without arguments", async t => {
  const blob = new Blob(["a", "b", "c"])
  const sliced = blob.slice()

  t.is(sliced.size, blob.size)
  t.is(await sliced.text(), await blob.text())
})

test(".slice() an empty blob with the start and the end set to 0", async t => {
  const blob = new Blob(["a", "b", "c"])
  const sliced = blob.slice(0, 0)

  t.is(sliced.size, 0)
  t.is(await sliced.text(), "")
})

test(".slice() slices the Blob within given range", async t => {
  const text = "The MIT License"
  const blob = new Blob([text]).slice(0, 3)

  t.is(await blob.text(), "The")
})

test(".slice() slices the Blob from arbitary start", async t => {
  const text = "The MIT License"
  const blob = new Blob([text]).slice(4, 15)

  t.is(await blob.text(), "MIT License")
})

test(".slice() takes type as the 3rd argument", t => {
  const expected = "text/plain"
  const blob = new Blob([], {type: "text/html"}).slice(0, 0, expected)

  t.is(blob.type, expected)
})

test(
  ".text() returns a the Blob content as string when awaited",

  async t => {
    const blob = new Blob([
      "a",
      new TextEncoder().encode("b"),
      new Blob(["c"]),
      new TextEncoder().encode("d").buffer,
    ])

    t.is(await blob.text(), "abcd")
  }
)

test(
  ".arrayBuffer() returns the Blob content as ArrayBuffer when awaited",

  async t => {
    const source = new TextEncoder().encode("abc")
    const blob = new Blob([source])

    t.true(Buffer.from(await blob.arrayBuffer()).equals(source))
  }
)
