// intent
import xs, { Stream } from 'xstream'
import { DOMSource } from '@cycle/dom'

import { State, Reducer } from './types'

import { path } from 'rambda'

const defaultState: State =
  { name: ''
  , isIncluded: false
  , value: ''
  , _default: ''
  }

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
        .select('input')
        .events('input')
        .map(path('target.value'))
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
