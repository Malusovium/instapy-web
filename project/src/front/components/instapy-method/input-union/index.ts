// index
import isolate from '@cycle/isolate'
import { intent } from './intent'
import { view } from './view'

import
  { State
  , Reducer
  , Component
  } from './types'

import
  { Arg
  } from './../arg'

import
  { inputConstant
  } from './../input-constant'

import
  { compose
  , map
  , values
  , path
  , zip
  , filter
  , reject
  } from 'rambda'

const defaultLens =
  (def, index) => (
    { get:
        (parentState) => (
          { ...parentState[`_${index}`]
          , isIncluded: true
          }
        )
    , set:
        (parentState, childState) => (
          { ...parentState
          , [`_${index}`]: childState
          }
        )
    }
  )

const constantComponentLens =
  (value: any, index:number) => (
    { get:
        (parentState) => (
          { ...parentState[`_${index}`]
          , isIncluded: true
          , value: value
          , _default: value
          }
        )
    , set:
        (parentState, childState) => (
          { ...parentState
          , [`_${index}`]: childState
          }
        )
    }
  )

const constantIsolate =
  (value:any) =>
    (_, index:number) =>
      isolate
      ( inputConstant
      , { onion: constantComponentLens(value, index)
        , '*': index
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

const isDynamic =
  (value: any) =>
    typeof value === 'object'
    && value._name !== undefined

const toArray =
  (arr: any) => [...arr]

const inputUnion =
  (_options): Component =>
    ({DOM, onion}) => {
      const constantChildComponents =
        compose
        ( toArray
        , map(constantIsolate)
        , reject(isDynamic)
        )(_options)
      const dynamicChildComponents =
        compose
        ( toArray
        , map
          ( Arg
            ( { _default: defaultLens
              , none: defaultLens
              , boolean: defaultLens
              , string: defaultLens
              , number: defaultLens
              , array: defaultLens
              , tuple: defaultLens
              , union: defaultLens
              }
            )
          )
        , filter(isDynamic)
        )(_options)

      const childComponents =
        compose
        ( map( ([index, makeComponent]) => makeComponent(null, index))
        , zip([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
        )([...constantChildComponents, ...dynamicChildComponents])
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
  , inputUnion
  }
