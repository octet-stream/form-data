import {createServer} from "http"

import busboy, {isFile} from "then-busboy"
import isPlainObject from "lodash.isplainobject"

const isArray = Array.isArray

const entries = Object.entries

async function mapFiles(obj, cb, ctx) {
  const res = isArray(obj) ? [] : {}

  for (const [key, value] of entries(obj)) {
    if (isPlainObject(value) || isArray(value)) {
      res[key] = await mapFiles(value, cb, ctx)
    } else {
      res[key] = await cb.call(ctx, value, key, obj)
    }
  }

  return res
}

const server = () => createServer((req, res) => {
  const onData = data => mapFiles(
    data, async value => isFile(value) ? String(await value.read()) : value
  )

  function onFulfilled(data) {
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(data))
  }

  function onRejected(err) {
    res.statusCode = err.status || 500
    res.end(String(err))
  }

  busboy(req).then(onData).then(onFulfilled, onRejected)
})

export default server
