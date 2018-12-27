// intent
import xs, { Stream } from 'xstream'
import { DOMSource } from '@cycle/dom'

import { State, Reducer } from './types'
import
  { path
  , compose
  , ifElse
  , is
  } from 'rambda'

const defaultState: State =
  { name: ''
  , isIncluded: false
  , value: 1
  , _default: 1
  , step: 1
  , min: -99999
  , max: 99999
  }

const maxRange =
  (max: number) =>
    (value:number) =>
      value > max ? max : value

const minRange =
  (min: number) =>
    (value: number) =>
      value < min ? min : value

const keepInRange =
  (min:number, max:number) =>
    compose
    ( maxRange(max)
    , minRange(min)
    )

const keepValidNumber =
  ( min: number
  , max: number
  , _default: number
  ) =>
    ifElse
    ( isNaN
    , () => _default
    , keepInRange(min, max)
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
        .select('input')
        .events('input')
        .map(path('target.value'))
        .map(Number)
        .map
         ( (newValue) =>
             (prevState) => (
               { ...prevState
               , value:
                  keepValidNumber
                  (prevState.min, prevState.max, prevState._default)
                  (newValue)
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
