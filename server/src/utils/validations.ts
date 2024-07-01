export function isValidDate(value: unknown) {
  const date = new Date(value as string)
  return !isNaN(date.getTime())
}
