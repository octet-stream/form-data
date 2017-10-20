function count(fd) {
  let counter = 0

  const iterator = fd.keys()

  while (iterator.next().done === false) {
    counter += 1
  }

  return counter
}

export default count
