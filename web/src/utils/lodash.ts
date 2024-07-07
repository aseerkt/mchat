export const debounce = <TFnArgs extends unknown[], TFnResult>(
  fn: (...args: TFnArgs) => TFnResult,
  ms: number,
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
