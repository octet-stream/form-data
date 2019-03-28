import test from "ava"

import FormData from "../../lib/FormData"

test("Should always return a boolean value", t => {
  t.is(typeof FormData.isFormData(), "boolean")
})

test("Should return \"true\" if given value is a FormData instance", t => {
  const fd = new FormData()

  t.true(FormData.isFormData(fd))
})

test(
  "Should return \"false\" if given value is not an instance of FormData",
  t => {
    const fd = new Map()

    t.false(FormData.isFormData(fd))
  }
)
