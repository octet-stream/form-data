/**
 * @api private
 */
function bind(names, ctx) {
  for (const name of names) {
    const fn = ctx[name]

    ctx[name] = fn.bind(ctx)
  }
}

export default bind
