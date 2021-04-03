import {Readable} from "stream"
import {ReadStream} from "fs"

import type {ReadableStream} from "web-streams-polyfill"

import isWHATWGStream from "./isWHATWGStream"
import isReadable from "./isReadable"

const isStream = (
  value: unknown
): value is ReadableStream | ReadStream | Readable => (
  isWHATWGStream(value) || isReadable(value)
)

export default isStream
