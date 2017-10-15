const read = stream => new Promise((resolve, reject) => {
  const chunks = []

  const onData = chunk => void chunks.push(chunk)

  const onEnd = () => void resolve(Buffer.concat(chunks))

  stream
    .on("error", reject)
    .on("data", onData)
    .on("end", onEnd)
})

export default read
