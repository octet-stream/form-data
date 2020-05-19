import {createReadStream, ReadStream} from "fs"
import {Readable} from "stream"

import {expectType as expect} from "tsd"

import FormData, {FormDataEntry} from "./FormData"

new FormData([
  {
    name: "field",
    value: "value"
  }
])

new FormData([
  {
    name: "file",
    value: Buffer.from("value"),
    filename: "foo.txt"
  }
])

const fd = new FormData()

expect<string>(fd.boundary)
expect<{"Content-Type": string}>(fd.headers)
expect<Readable>(fd.stream)
expect<string>(fd[Symbol.toStringTag])

expect<Promise<number | void>>(fd.getComputedLength())

expect<void>(fd.append("field", "value"))
fd.append("file", createReadStream(__filename))
fd.append("file", new Readable({read() { }}))

expect<void>(fd.set("field", "value"))
fd.set("file", createReadStream(__filename))
fd.set("file", new Readable({read() { }}))

expect<boolean>(fd.has("field"))
expect<FormDataEntry | void>(fd.get("field"))
expect<Array<FormDataEntry | void>>(fd.getAll("field"))

expect<void>(fd.delete("field"))

expect<string>(fd.toString())

expect<string>(fd.inspect())

expect<IterableIterator<string>>(fd.keys())

expect<IterableIterator<FormDataEntry>>(fd.values())

expect<IterableIterator<[string, FormDataEntry]>>(fd.entries())

expect<void>(fd.forEach(() => {}))

fd.forEach((value, name, fd) => {
  expect<any>(value)
  expect<string>(name)
  expect<FormData>(fd)
})

expect<IterableIterator<[string, FormDataEntry]>>(fd[Symbol.iterator]())

expect<AsyncIterableIterator<Buffer>>(fd[Symbol.asyncIterator]())
