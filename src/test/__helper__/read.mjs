async function readStreamWithAsyncIterator(form) {
  const contents = []

  for await (const chunk of form) {
    contents.push(chunk)
  }

  return Buffer.concat(contents)
}

export default readStreamWithAsyncIterator
