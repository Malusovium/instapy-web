import isolate from '@cycle/isolate'
import { api
       , ArgComponentType
       } from 'instapy-tools'

import { ifElse
       , omit
       , pathOr
       } from 'rambda'

import { mustObject
       } from './../utils/must'

import { inputNone } from './input-none'
import { inputBoolean } from './input-boolean'
import { inputString } from './input-string'
import { inputNumber } from './input-number'
import { inputArray } from './input-array'
import { inputTuple } from './input-tuple'
import { inputUnion } from './input-union'

const { setupArgComponent } = api

const includeValue =
  (argName:string, parentState, childState) => (
    { value: childState.isIncluded
        ?  { ...parentState.value
            , [argName]: childState.value
            }
        : omit(argName, parentState.value)
    }
  )

const includeValueUnion =
  (argName:string, def, active, parentState, childState) => (
    { value:
        childState.isIncluded
          ?  { ...parentState.value
             , [argName]:
                  childState[`_${active}`] === undefined
                    ? def
                    : childState[`_${active}`].value
             }
          : omit(argName, parentState.value)
    }
  )

const defaultLens =
  (def, argName, _) => (
    { get:
        (parentState) => (
          { ...parentState[`_${argName}`]
          , _default: def
          , name: argName
          , value:
              pathOr
              ( def
              , [ `_${argName}`, 'value' ]
              , parentState
              )
          }
        )
    , set:
        (parentState, childState) => (
          { ...parentState
          , [`_${argName}`]: childState
          , ...includeValue(argName, parentState, childState)
          }
        )
    }
  )

const maybeObject =
  (key: string, value: any) =>
    value === undefined
      ? {}
      : { [key]: value }

const numberLens =
  (def, argName, { _step, _min, _max }) => (
    { get:
        (parentState) => (
          { ...parentState[`_${argName}`]
          , _default: def
          , name: argName
          , value:
              pathOr
              ( def
              , [ `_${argName}`, 'value' ]
              , parentState
              )
          , ...maybeObject('step', _step)
          , ...maybeObject('min', _min)
          , ...maybeObject('max', _max)
          }
        )
    , set:
        (parentState, childState) => (
          { ...parentState
          , [`_${argName}`]: childState
          , ...includeValue(argName, parentState, childState)
          }
        )
    }
  )

const unionLens =
  (def, argName) => (
    { get:
        (parentState) => (
          { ...parentState[`_${argName}`]
          , _default: def
          , name: argName
          , value:
              pathOr
              ( def
              , [ `_${argName}`, 'value' ]
              , parentState
              )
          }
        )
    , set:
        (parentState, childState) => (
          { ...parentState
          , [`_${argName}`]: childState
          , ...includeValueUnion
              ( argName
              , def
              , childState.active
              , parentState
              , childState
              )
          }
        )
    }
  )

const argIsolate =
  (component, lens, _sub = undefined) =>
    (def, argName) =>
      isolate
      ( component
      , { onion: lens(def, argName, _sub)
        , '*': argName
        }
      )

export const Arg=
  ( { _default = defaultLens
    , none = defaultLens
    , boolean = defaultLens
    , string = defaultLens
    , number = numberLens
    , array = defaultLens
    , tuple = defaultLens
    , union = unionLens
    }
  ): ArgComponentType =>
    setupArgComponent
    ( { _default: argIsolate(inputNone, _default)
      , none: argIsolate(inputNone, none)
      , boolean: argIsolate(inputBoolean, boolean)
      , string: argIsolate(inputString, string)
      , number: (_constraints) => argIsolate(inputNumber, number, _constraints)
      , array: () => argIsolate(inputArray, array)
      , tuple: (_subTypes) => argIsolate(inputTuple(_subTypes), tuple)
      , union: (_options) => argIsolate(inputUnion(_options), union)
      }
    )
