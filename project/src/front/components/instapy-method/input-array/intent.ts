// intent
import xs, { Stream } from 'xstream'
import { DOMSource } from '@cycle/dom'

import { State, Reducer } from './types'

import { path
       , replace
       , split
       , equals
       , reject
       , compose
       , map
       } from 'rambda'

const defaultState: State =
  { name: ''
  , isIncluded: false
  , value: []
  , _default: []
  }

type FilterOut =
  (match:string) => (inArr:string[]) => string[]

const filterOut: FilterOut =
  compose<any, any, any>
  ( reject
  , equals
  )

const intent =
  (DOM: DOMSource) => {
    const init$ =
      xs
        .of<Reducer>
         ( (prev) => (
             { ...defaultState
             , ...prev
             }
           )
         )

    const include$ =
      DOM
        .select('[data-include]')
        .events('click')
        .mapTo
         ( (prevState) => (
             { ...prevState
             , isIncluded: !prevState.isIncluded
             }
           )
         )

    const add$ =
      DOM
        .select('[data-add]')
        .events('click')
        .mapTo
         ( (prev) => (
             { ...prev
             , value: [ ...prev.value, '' ]
             }
           )
         )

    return xs.merge
              ( init$
              , include$
              , add$
              )
  }

export
  { intent
  }
