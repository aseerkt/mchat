export const debounce = <TFnArgs extends unknown[], TFnResult>(
  fn: (...args: TFnArgs) => TFnResult,
  ms = 300,
): ((...args: TFnArgs) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: TFnArgs) {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      fn(...args)
      timeout = null
    }, ms)
  }
}

export const memoize = <TFnArgs extends unknown[], TFnResult>(
  fn: (...args: TFnArgs) => TFnResult,
) => {
  const cache = new Map<string, TFnResult>()

  return (...args: TFnArgs) => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}
