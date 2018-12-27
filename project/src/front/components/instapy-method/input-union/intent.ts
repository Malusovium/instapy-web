// intent
import xs, { Stream } from 'xstream'
import { DOMSource } from '@cycle/dom'

import { State, Reducer } from './types'

import
  { path
  } from 'rambda'

const defaultState: State =
  { name: ''
  , isIncluded: false
  , value: ''
  , active: 0
  , pickListOpen: false
  }

const intent =
  (DOM: DOMSource, components) => {
    const init$ =
      xs
        .of<Reducer>
         ( (prev) => (
             { ...defaultState
             , ...prev
             }
           )
         )

    const pick$ =
      DOM
        .select('div[data-pick]')
        .events('click')
        .map(path('target.dataset.pick'))
        .map
         ( (newActive) =>
             (prevState) => (
               { ...prevState
               , active: newActive
               }
             )
         )

    const openPickList$ =
      DOM
        .select('div[data-pick-open]')
        .events('click')
        .mapTo
         ( (prevState) => (
             { ...prevState
             , pickListOpen: true
             }
           )
         )

    const closePickList$ =
      pick$
        .mapTo
         ( (prevState) => (
             { ...prevState
             , pickListOpen: false
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

    return xs.merge
              ( init$
              , include$
              , pick$
              , openPickList$
              , closePickList$
              , ...components
              )
  }

export
  { intent
  }
