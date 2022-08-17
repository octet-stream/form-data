import test from "ava"

import sinon from "sinon"

import {Blob} from "./Blob.js"
import {File} from "./File.js"
import {FormData} from "./FormData.js"

const {spy} = sinon

test("Recognizes FormData instances", t => {
  t.true(new FormData() instanceof FormData)
})

test("Recognizes custom FormData implementation as FormData instance", t => {
  class MyFormData {
    append() { }

    set() { }

    get() { }

    getAll() { }

    has() { }

    delete() { }

    entries() { }

    values() { }

    keys() { }

    forEach() { }

    [Symbol.iterator]() { }

    get [Symbol.toStringTag]() { return "FormData" }
  }

  t.true(new MyFormData() instanceof FormData)
})

test("Returns false for instanceof checks with null", t => {
  // @ts-expect-error
  t.false(null instanceof FormData)
})

test("Returns false for instanceof checks with undefined", t => {
  // @ts-expect-error
  t.false(undefined instanceof FormData)
})

test(".set() creates a new File if 3rd argument is present", t => {
  const file = new File(["Some content"], "file.txt")
  const form = new FormData()

  form.set("file", file, "renamed-file.txt")

  t.not(form.get("file"), file)
})

test("File created from Blob has proper default name", t => {
  const form = new FormData()

  form.set("file", new Blob(["Some content"]))

  t.is((form.get("file") as File).name, "blob")
})

test("Assigns a filename argument to Blob field", t => {
  const expected = "some-file.txt"

  const blob = new Blob(["Some content"])
  const form = new FormData()

  form.set("file", blob, expected)

  t.is((form.get("file") as File).name, expected)
})

test("User-defined filename has higher precedence", t => {
  const expected = "some-file.txt"

  const file = new File(["Some content"], "file.txt")
  const form = new FormData()

  form.set("file", file, expected)

  t.is((form.get("file") as File).name, expected)
})

test("Third argument overrides File.name even if it was set to null", t => {
  const file = new File(["Some content"], "file.txt")
  const form = new FormData()

  // @ts-expect-error
  form.set("file", file, null)

  t.is((form.get("file") as File).name, "null")
})

test(".set() appends a string field", t => {
  const form = new FormData()

  form.set("field", "string")

  t.is(form.get("field"), "string")
})

test(".set() replaces a field with the same name", t => {
  const form = new FormData()

  form.set("field", "one")

  t.is(form.get("field"), "one")

  form.set("field", "two")

  t.is(form.get("field"), "two")
})

test(".set() replaces existent field values created with .append()", t => {
  const form = new FormData()

  form.append("field", "one")
  form.append("field", "two")

  t.deepEqual(form.getAll("field"), ["one", "two"])

  form.set("field", "one")

  t.deepEqual(form.getAll("field"), ["one"])
})

test(".append() append a new field", t => {
  const form = new FormData()

  form.append("field", "string")

  t.deepEqual(form.getAll("field"), ["string"])
})

test(".append() appends to an existent field", t => {
  const form = new FormData()

  form.append("field", "one")
  form.append("field", "two")

  t.deepEqual(form.getAll("field"), ["one", "two"])
})

test(
  ".append() appends to an existent field even if it was created with .set()",

  t => {
    const form = new FormData()

    form.set("field", "one")
    form.append("field", "two")

    t.deepEqual(form.getAll("field"), ["one", "two"])
  }
)

test(".has() returns false for non-existent field", t => {
  const form = new FormData()

  t.false(form.has("field"))
})

test(".delete() removes a field", t => {
  const form = new FormData()

  form.set("field", "Some data")

  t.true(form.has("field"))

  form.delete("field")

  t.false(form.has("field"))
})

test(".get() returns null for non-existent field", t => {
  const form = new FormData()

  t.is(form.get("field"), null)
})

test(".get() returns number values as string", t => {
  const form = new FormData()

  form.set("field", 42)

  t.is(form.get("field"), "42")
})

test(".get() returns only first value from the field", t => {
  const form = new FormData()

  form.append("field", "one")
  form.append("field", "two")

  t.is(form.get("field"), "one")
})

test(".get() returns Blob as a File", t => {
  const blob = new Blob(["Some text"])
  const form = new FormData()

  form.set("blob", blob)

  t.true(form.get("blob") instanceof File)
})

test(".get() returns File as-is", t => {
  const file = new File(["Some text"], "file.txt")
  const form = new FormData()

  form.set("file", file)

  t.true(form.get("file") instanceof File)
})

test(".get() returns the same File that was added to FormData", t => {
  const file = new File(["Some text"], "file.txt")
  const form = new FormData()

  form.set("file", file)

  t.is(form.get("file"), file)
})

test(".getAll() returns an empty array for non-existent field", t => {
  const form = new FormData()

  t.deepEqual(form.getAll("field"), [])
})

test(".getAll() returns all values associated with given key", t => {
  const expected = ["one", "two", "three"]
  const form = new FormData()

  form.append("field", expected[0])
  form.append("field", expected[1])
  form.append("field", expected[2])

  const actual = form.getAll("field")

  t.is(actual.length, 3)
  t.deepEqual(actual, expected)
})

test(
  ".forEach() callback should not be called when FormData has no fields",

  t => {
    const cb = spy()

    const fd = new FormData()

    fd.forEach(cb)

    t.false(cb.called)
  }
)

test(
  ".forEach() callback should be called with the nullish context by default",
  t => {
    const cb = spy()

    const form = new FormData()

    form.set("name", "John Doe")

    form.forEach(cb)

    t.is(cb.firstCall.thisValue, undefined)
  }
)

test(".forEach() callback should be called with the specified context", t => {
  const cb = spy()

  const ctx = new Map()

  const form = new FormData()

  form.set("name", "John Doe")

  form.forEach(cb, ctx)

  t.true(cb.firstCall.thisValue instanceof Map)
  t.is(cb.firstCall.thisValue, ctx)
})

test(
  ".forEach() callback should be called with value, name and FormData itself",
  t => {
    const cb = spy()

    const form = new FormData()

    form.set("name", "John Doe")

    form.forEach(cb)

    const [value, key, instance] = cb.firstCall.args

    t.is(value, "John Doe")
    t.is(key, "name")
    t.is(instance, form)
  }
)

test(".forEach() callback should be called once on each filed", t => {
  const cb = spy()

  const form = new FormData()

  form.set("first", "value")
  form.set("second", 42)
  form.set("third", [1, 2, 3])

  form.forEach(cb)

  t.true(cb.calledThrice)
})

test(".values() is done on the first call when there's no data", t => {
  const form = new FormData()

  const curr = form.values().next()

  t.deepEqual(curr, {
    done: true,
    value: undefined
  })
})

test(".values() Returns the first value on the first call", t => {
  const form = new FormData()

  form.set("first", "value")
  form.set("second", 42)
  form.set("third", [1, 2, 3])

  const curr = form.values().next()

  t.deepEqual(curr, {
    done: false,
    value: "value"
  })
})

test(".value() yields every value from FormData", t => {
  const form = new FormData()

  form.set("first", "value")
  form.set("second", 42)
  form.set("third", [1, 2, 3])

  t.deepEqual([...form.values()], ["value", "42", "1,2,3"])
})

test(".keys() is done on the first call when there's no data", t => {
  const form = new FormData()

  const curr = form.keys().next()

  t.deepEqual(curr, {
    done: true,
    value: undefined
  })
})

test(".keys() Returns the first value on the first call", t => {
  const form = new FormData()

  form.set("first", "value")
  form.set("second", 42)
  form.set("third", [1, 2, 3])

  const curr = form.keys().next()

  t.deepEqual(curr, {
    done: false,
    value: "first"
  })
})

test(".keys() yields every key from FormData", t => {
  const form = new FormData()

  form.set("first", "value")
  form.set("second", 42)
  form.set("third", [1, 2, 3])

  t.deepEqual([...form.keys()], ["first", "second", "third"])
})

test(".toString() returns a proper string", t => {
  t.is(new FormData().toString(), "[object FormData]")
})

test(".set() throws TypeError when called with less than 2 arguments", t => {
  const form = new FormData()

  // @ts-expect-error
  const trap = () => form.set("field")

  t.throws<TypeError>(trap, {
    instanceOf: TypeError,
    message: "Failed to execute 'set' on 'FormData': "
      + "2 arguments required, but only 1 present."
  })
})

test(
  ".set() throws TypeError when the filename argument is present, "
    + "but the value is not a File",

  t => {
    const form = new FormData()

    const trap = () => form.set("field", "Some value", "field.txt")

    t.throws<TypeError>(trap, {
      instanceOf: TypeError,
      message: "Failed to execute 'set' on 'FormData': "
        + "parameter 2 is not of type 'Blob'."
    })
  }
)

test(".append() throws TypeError when called with less than 2 arguments", t => {
  const form = new FormData()

  // @ts-expect-error
  const trap = () => form.append("field")

  t.throws<TypeError>(trap, {
    instanceOf: TypeError,
    message: "Failed to execute 'append' on 'FormData': "
      + "2 arguments required, but only 1 present."
  })
})

test(
  ".append() throws TypeError when the filename argument is present, "
    + "but the value is not a File",

  t => {
    const form = new FormData()

    const trap = () => form.append("field", "Some value", "field.txt")

    t.throws<TypeError>(trap, {
      instanceOf: TypeError,
      message: "Failed to execute 'append' on 'FormData': "
        + "parameter 2 is not of type 'Blob'."
    })
  }
)
