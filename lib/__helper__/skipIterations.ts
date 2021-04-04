/**
 * Skips given amount of iteration on given async-iterable object
 *
 * @param iterable Target async-iterable object
 * @param skip An amount of iteration to skip
 */
async function skipIterations<
  T = unknown,
  TReturn = any,
  TNext = unknown
>(iterable: AsyncGenerator<T, TReturn, TNext>, skip = 0) {
  while (skip--) {
    await iterable.next()
  }

  return iterable
}

export default skipIterations
