// index
import { intent } from './intent'
import { view } from './view'

import { State
       , Reducer
       , Component
       } from './types'

import
  { compose
  , ifElse
  , reject
  , filter
  , startsWith
  , equals
  , map
  , join
  , values
  , find
  , Dictionary
  } from 'rambda'

import { mustArray } from './../../utils/must'
import { api } from './../../../../src'

const { raw, setupMethod, setupCreate } = api

const pyMethod = setupMethod(raw)
const pyCreate = setupCreate()

type orderMethods =
  (methods: {name:string, args:any[]}[] ) => {name:string, args:any[]}
const orderMethods =
  (methods) => {
    const init =
      find
      ( ({name}) => name === '__init__'
      , methods
      )
    const end =
      find
      ( ({name}) => name === 'end'
      , methods
      )
    const methodsWithoutInitEnd =
      reject
      ( ({name}) =>
          name === '__init__'
          || name === 'end'
      , methods
      )
    const setMethods =
      filter
      ( ({name}) => startsWith('set_', name)
      , methodsWithoutInitEnd
      )
    const notSetMethods =
      reject
      ( ({name}) => startsWith('set_', name)
      , methodsWithoutInitEnd
      )

    const orderedArray =
      [ ...mustArray
        ( init !== undefined
        , init
        )
      , ...setMethods
      , ...notSetMethods
      , ...mustArray
        ( end !== undefined
        , end
        )
      ]

    return orderedArray
  }

type methodsToConfig =
  (methods: {[index:string]: {} }) => string
const methodsToConfig:methodsToConfig =
  compose
  ( pyCreate
  , map<any, any>(pyMethod)
  , orderMethods
  , values
  , map<any, any>
    ( (args, methodName) => (
        { name: methodName
        , args: args
        }
      )
    )
  )

const toConfigReducer =
  (fromState:State) => (
    { ...fromState
    , config:
        ifElse
        ( equals({})
        , (_) => 'Please check a method'
        , methodsToConfig
        )(fromState.methods)
    }
  )

const configOut: Component =
  ({DOM, onion}) => {
    const computedState$ =
      onion.state$
        .map(toConfigReducer)
    const copy$ =
       computedState$
         .map
          ( ({config}) => (
              { selector: '#copy'
              , message: config
              }
            )
          )

    return (
      { DOM: view(computedState$)
      , onion: intent(DOM)
      , copy: copy$
      }
    )
  }

export
  { State
  , configOut
  }
