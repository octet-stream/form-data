import http from "http"
import fs from "fs"

import toObject from "object-deep-from-entries"

import {parse} from "then-busboy"

const server = () => http.createServer((req, res) => {
  // TODO: Rewrite this function due to upcoming then-busboy changes
  async function transform(body) {
    const files = await Promise.all(body.files.entries().map(
      ([path, file]) => fs.promises.readFile(file.path).then(content => [
        path, String(content)
      ])
    ))

    return toObject([
      ...body.fields.entries().map(([path, {value}]) => [path, value]),
      ...files
    ])
  }

  function onFulfilled(data) {
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(data))
  }

  function onRejected(err) {
    console.log(err)
    res.statusCode = err.status || 500
    res.end(String(err))
  }

  parse(req).then(transform).then(onFulfilled)
    .catch(onRejected)
})

export default server
