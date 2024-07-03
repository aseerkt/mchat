export const timeout = (timeout: number) =>
  new Promise(res => setTimeout(res, timeout))
