const sleep = (ms: number) => new Promise<void>(cb => setTimeout(cb, ms))

export default sleep
