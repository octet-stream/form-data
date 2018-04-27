const read = stream => new Promise((resolve, reject) => {
  const contents = []

  const onData = () => {
    const chunk = stream.read()

    if (chunk != null) {
      contents.push(chunk)
    }
  }

  const onEnd = () => void resolve(Buffer.concat(contents))

  stream
    .on("error", reject)
    .on("readable", onData)
    .on("end", onEnd)
})

export default read
