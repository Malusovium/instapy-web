import { compose
       , equals
       , path
       , type as rType
       } from 'rambda'

type CompareType =
  'Function'
  | 'Async'
  | 'Array'
  | 'Object'
  | 'String'
  | 'Number'
  | 'Boolean'
  | 'Null'
  | 'RegExp'
type IsPathType =
  (pathLocation: string, compareType: CompareType) =>
    (value: object) => boolean

const isPathType: IsPathType =
  (pathLocation, compareType) =>
    compose
    ( equals(compareType)
    , rType
    , path(pathLocation)
    )

export
  { isPathType
  }
