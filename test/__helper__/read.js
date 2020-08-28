async function readFromStream(form) {
  const contents = []

  for await (const chunk of form) {
    contents.push(chunk)
  }

  return Buffer.concat(contents)
}

module.exports = readFromStream
