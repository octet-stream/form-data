const http = require("http")
const fs = require("fs")

const toObject = require("object-deep-from-entries")

const {parse} = require("then-busboy")

const server = () => http.createServer((req, res) => {
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

module.exports = server
