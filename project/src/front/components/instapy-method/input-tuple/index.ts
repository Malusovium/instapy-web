// index
import { intent } from './intent'
import { view } from './view'

import
  { State
  , Reducer
  , Component
  } from './types'

import
  { map
  , values
  , path
  , compose
  , zip
  , pathOr
  , update
  } from 'rambda'

import
  { Arg
  } from './../arg'

import { mustObject } from './../../../utils/must'

const defaultLens =
  (_0, key, _1) => (
    { get: (parentState) => (
        { ...parentState[`_${key}`]
        , isIncluded: true
        , _default: parentState._default[key]
        , value:
            pathOr
            ( parentState._default[key]
            , [ `_${key}`, 'value' ]
            , parentState
            )
        }
      )
    , set: (parentState, childState) => (
        { ...parentState
        , [`_${key}`]: childState
        , value:
            update
            ( key
            , childState.value
            , parentState.value
            )
        }
      )
    }
  )

const numberLens =
  (_, key, { _step, _min, _max }) => (
    { get:
        (parentState) => (
          { ...parentState[`_${key}`]
          , isIncluded: true
          , _default: parentState._default[key]
          , value:
              pathOr
              ( parentState._default[key]
              , [ `_${key}`, 'value' ]
              , parentState
              )
          , ...mustObject(_step === undefined, ['step', _step])
          , ...mustObject(_min === undefined, ['min', _min])
          , ...mustObject(_max === undefined, ['max', _max])
          }
        )
    , set:
        (parentState, childState) => (
          { ...parentState
          , [`_${key}`]: childState
          , value:
              update
              ( key
              , childState.value
              , parentState.value
              )
          }
        )
    }
  )

const unionLens =
  (_, key) => (
    { get:
        (parentState) => (
          { ...parentState[`_${key}`]
          , isIncluded: true
          , _default: parentState._default[key]
          , value:
              pathOr
              ( parentState._default[key]
              , [ `_${key}`, 'value' ]
              , parentState
              )
          }
        )
    , set:
        (parentState, childState) => (
          { ...parentState
          , [`_${key}`]: childState
          , value:
              update
              ( key
              , childState[`_${childState.active}`] === undefined
                  ? parentState._default[key]
                  : childState[`_${childState.active}`].value
              , parentState.value
              )
          }
        )
    }
  )

const compList =
  (childComponents) =>
    ({DOM, onion}) => {
      const childComponentsSinks =
        map
        ( (component:Component) => component({DOM, onion})
        , childComponents
        )
      const childComponentsDOM =
        map(path('DOM'), childComponentsSinks)
      const childComponentsOnion =
        map(path('onion'), childComponentsSinks)

      return (
        { DOM: childComponentsDOM
        , onion: childComponentsOnion
        }
      )
    }

const inputTuple =
  (_subTypes): Component =>
    ({DOM, onion}) => {
      const childComponents =
        compose
        ( map( ([index, makeComponent]) => makeComponent(null, index))
        , zip([0,1,2,3,4,5,6,7,8,9])
        , map
          ( Arg
            ( { _default: defaultLens
              , none: defaultLens
              , boolean: defaultLens
              , string: defaultLens
              , number: numberLens
              , array: defaultLens
              , tuple: defaultLens
              , union: unionLens
              }
            )
          )
        )(_subTypes)
      const childComponentsSinks =
        compList(childComponents)({DOM, onion})

      return (
        { DOM:
            view
            ( onion.state$
            , childComponentsSinks.DOM
            )
        , onion:
            intent
            ( DOM
            , childComponentsSinks.onion
            )
        }
      )
    }

export
  { State
  , inputTuple
  }
