export const removeAttrFromObject = <O extends object, A extends keyof O>(
  object: O,
  attr: A
): Omit<O, A> => {
  const newObject = { ...object }

  if (attr in newObject) {
    delete newObject[attr]
  }

  return newObject
}
