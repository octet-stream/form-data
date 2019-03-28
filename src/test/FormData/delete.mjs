import test from "ava"

import FormData from "../../lib/FormData"

test("Should delete field by it key", t => {
  const fd = new FormData()

  fd.set("name", "value")

  t.true(fd.has("name"))

  fd.delete("name")

  t.false(fd.has("name"))
})
