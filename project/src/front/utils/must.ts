import
  { is
  } from 'rambda'

const mustObject =
  (condition: boolean, [ key, value ]: any) =>
    condition
      ? { [key]: value }
      : {}

const mustArray =
  (condition: boolean, val: any) =>
    condition
      ? [ val ]
      : []

export
  { mustObject
  , mustArray
  }
