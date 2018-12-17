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

const lP =
  (val:any) => { console.log(val); return val}

const isPathType: IsPathType =
  (pathLocation, compareType) =>
    compose
    // ( lP
    ( equals(compareType)
    // , lP
    , rType
    , path(pathLocation)
    )

export
  { isPathType
  }
