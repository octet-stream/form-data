const test = require("ava")

const FormData = require("../../lib/FormData")

test("Should be done on the first call when FormData have no fields", t => {
  const fd = new FormData()

  const curr = fd.keys().next()

  t.deepEqual(curr, {
    done: true,
    value: undefined
  })
})

test("Should return the first key on the first call", t => {
  const fd = new FormData()

  fd.set("first", "value")
  fd.set("second", 42)
  fd.set("third", [1, 2, 3])

  const curr = fd.keys().next()

  t.deepEqual(curr, {
    done: false,
    value: "first"
  })
})
