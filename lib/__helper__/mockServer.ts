import {createServer} from "http"

import {parse} from "then-busboy"

import toObject from "object-deep-from-entries"
import req from "supertest"

import readStream from "./readStream"

async function transform(body: any) {
  const files = await Promise.all(body.files.entries().map(
    ([path, file]) => readStream(file.stream(), "utf-8").then(content => [
      path, content
    ])
  ))

  return toObject([
    ...body.fields.entries().map(([path, {value}]) => [path, value]),
    ...files
  ])
}

const mockServer = () => req(createServer((req, res) => {
  function onFulfilled(data: any) {
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(data))
  }

  function onRejected(err: Error & {status?: number}) {
    res.statusCode = err.status || 500
    res.end(String(err))
  }

  parse(req).then(transform).then(onFulfilled, onRejected)
}))

export default mockServer