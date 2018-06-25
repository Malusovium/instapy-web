import { equals } from 'rambda'

export const _throw =
  (message:string) => {
    throw new Error(message)
  }

export const throwWhen =
  (message:string, valueA:any) =>
    (valueB:any) =>
      equals(valueA, valueB)
        ? _throw(message)
        : valueB
