function bind(names, ctx) {
  for (const name of names) {
    const fn = ctx[name]

    if (typeof fn === "function") {
      ctx[name] = fn.bind(ctx)
    }
  }
}

export default bind
