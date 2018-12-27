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

    const input$ =
      DOM
        .select('textarea')
        .events('input')
        .map(path('target.value'))
        .map(replace(/#/g, ' #'))
        .map(split(' '))
        .map(filterOut(''))
        .map(filterOut('#'))
        .debug('arr')
        .map
         ( (newValue) =>
             (prevState) => (
               { ...prevState
               , value: newValue
               }
             )
         )

    return xs.merge
              ( init$
              , include$
              , input$
              )
  }

export
  { intent
  }
