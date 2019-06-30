import test from "ava"

import FormData from "../../lib/FormData"

test("Removes a field by its key", t => {
  const fd = new FormData()

  fd.set("name", "value")

  t.true(fd.has("name"))

  fd.delete("name")

  t.false(fd.has("name"))
})
