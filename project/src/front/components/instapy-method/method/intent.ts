// intent
import xs, { Stream } from 'xstream'
import { DOMSource } from '@cycle/dom'

import { State, Reducer } from './types'

const defaultState: State =
  { name: 'Method'
  , order: -1
  , isOpen: false
  , deletable: true
  }

const intent =
  (DOM: DOMSource, childComponentOnion) => {
    const init$ =
      xs
        .of<Reducer>
         ( (prev) => (
             { ...defaultState
             , ...prev
             }
           )
         )

    const open$ =
      DOM
        .select('[data-open-switch]')
        .events('click')
        .mapTo
         ( (prevState) => (
             { ...prevState
             , isOpen: !prevState.isOpen
             }
           )
         )

    return xs.merge
              ( init$
              , open$
              , ...childComponentOnion
              )
  }

export
  { intent
  }
