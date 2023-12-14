export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw Error(`expected value to be defined, got ${value}`)
  }
}