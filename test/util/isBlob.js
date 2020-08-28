const Blob = require("fetch-blob")
const test = require("ava")

const isBlob = require("../../lib/util/isBlob")

class File extends Blob {
  constructor() {
    super([], {
      type: "application/octet-stream"
    })
  }
}

test("Returns true for Blob instances", t => {
  t.true(isBlob(new Blob()))
})

test("Returns true for File instances", t => {
  t.true(isBlob(new File()))
})

test("Returns false for non File or Blob -like instances", t => {
  t.false(isBlob(new Map()))
})

test(
  "Returns false for non File or Blob -like instances, " +
  "but with valid methods/props",
  t => {
    class NotBlob {
      constructor() {
        this.type = ""

        this.size = null
      }

      arrayBuffer() { }

      stream() { }
    }

    t.false(isBlob(new NotBlob()))
  }
)

test("Returns false for plain objects", t => {
  t.false(isBlob({}))
})

test("Returns false for plain objects, but with the valid methods/props", t => {
  t.false(isBlob({
    type: "",
    size: null,

    arrayBuffer() { },

    stream() { }
  }))
})
