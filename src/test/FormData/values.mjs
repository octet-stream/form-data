import test from "ava"

import FormData from "../../lib/FormData"

test("Should be done on the first call when FormData have no fields", t => {
  t.plan(1)

  const fd = new FormData()

  const curr = fd.values().next()

  t.deepEqual(curr, {
    done: true,
    value: undefined
  })
})

test("Should return the first value on the first call", t => {
  t.plan(1)

  const fd = new FormData()

  fd.set("first", "value")
  fd.set("second", 42)
  fd.set("third", [1, 2, 3])

  const curr = fd.values().next()

  t.deepEqual(curr, {
    done: false,
    value: "value"
  })
})
