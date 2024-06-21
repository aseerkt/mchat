export const isRequired = (message = 'Field is required') => {
  return function (value: string) {
    return value ? undefined : message
  }
}
