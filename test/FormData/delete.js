const test = require("ava")

const FormData = require("../../lib/FormData")

test("Deletes fields by field name, coercing the field names to strings", t => {
  const fd = new FormData()

  fd.set("a", "a")
  fd.delete("a")

  fd.set(1, "b")
  fd.delete("1")

  fd.set(false, "c")
  fd.delete("false")

  fd.set(null, "d")
  fd.delete("null")

  fd.set(undefined, "e")
  fd.delete("undefined")

  t.is(Array.from(fd.entries()).length, 0)
})
