import test from "ava"

import FormData from "../../lib/FormData"

test("Should delete field by it key", t => {
  t.plan(2)

  const fd = new FormData()

  fd.set("name", "value")

  t.true(fd.has("name"))

  fd.delete("name")

  t.false(fd.has("name"))
})
