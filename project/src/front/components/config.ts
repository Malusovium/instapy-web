import xs, { Stream } from 'xstream'
import { div
       , input
       , VNode
       , DOMSource 
       } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import isolate from '@cycle/isolate'

import { style, stylesheet } from 'typestyle'
import * as csstips from 'csstips'

import { BaseSources, BaseSinks } from '../interfaces'

import { ColorPallete } from '../utils/color-pallete'
import { transition
       , Transition
       , snabbTransition
       , SnabbTransition
       } from '../utils/snabb-transitions'

import { ConfigControls } from './config-controls'
import { ConfigInput } from './config-input'

export interface Sources extends BaseSources {
  onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
  onion?: Stream<Reducer>
}

export type State =
  { config: any
  , controls: any
  , input: any
  }

export const defaultState: State =
  { config:
    { init: { name: '__init__' }
    , end: { name: 'end' }
    , middle:
      []
    }
  , controls: {}
  , input: {}
  }

export type Reducer = (prev: State) => State | undefined

const initReducer = (defaultState:any) =>
  (prev:any) => ({...defaultState, ...prev})

export type Classes =
  { outer: string
  , inner: string
  , elem: string
  }

export const Style = 
  ( { mainText
    } : ColorPallete
  ) =>
    stylesheet
    ( { outer:
        { fontSize: '1em'
        , padding: '.4em'
        , color: mainText
        }
      , inner:
        { fontSize: '1em'
        }
      , elem:
        { fontSize: '1em'
        }
      }
    )

export type Transitions =
  { outer: SnabbTransition | false
  , inner: SnabbTransition | false
  }

export const Transitions: Transitions =
 { outer: false
 , inner:
    snabbTransition
    ( [ transition('opacity', 1)('0', { add: '1', rem: '0'} ) ] )
 }

const configLens =
  (key) => (
    { get:
       (state) => (
         { ...state[key]
         , ...state.config
         }
       )
    , set:
       (state, childState) => (
         { ...state
         , [key]: childState
         , config:
           { init: childState.init
           , end: childState.end
           , middle: childState.middle
           }
         }
       )
    }
  )

export const Config =
  (colors: ColorPallete) =>
    ({ DOM, onion, back}: Sources): Sinks => {
      const configControls =
        isolate
        ( ConfigControls(colors)
        , { onion: configLens('controls')
          , '*': 'controls'
          }
        )({ DOM, onion, back})

      const configInput =
        isolate
        ( ConfigInput(colors)
        , { onion: configLens('input')
          , '*': 'input'
          }
        )({DOM, onion})

      const action$: Stream<Reducer> = intent(DOM, back)
      const vdom$: Stream<VNode> =
        view
        ( Style(colors)
        , Transitions
        )
        ( onion.state$
        , configControls.DOM
        , configInput.DOM
        )

      return { DOM: vdom$
             , onion:
                 xs.merge
                    ( action$
                    , configControls.onion
                    , configInput.onion
                    )
             , back: configControls.back
             }
    }

const intent = (DOM: DOMSource, back: Stream<any>): Stream<Reducer> => {
  const init$ = xs.of<Reducer>(
    initReducer(defaultState)
  )

  return xs.merge(init$)
}

const view = (css:Classes, trans:Transitions) =>
  ( state$: Stream<State>
  , configControlsDOM: Stream<VNode>
  , configInputDOM: Stream<VNode>
  ): Stream<VNode> =>
    xs.combine
       ( state$
       , configControlsDOM
       , configInputDOM
       )
      .map
       ( ( [ { myNumber
             }
           , ConfigControlsDOM
           , ConfigInputDOM
           ]
         ) =>
           div
           ( `.${css.outer}`
           , { style: trans.outer}
           , [ div
               (`.${css.inner}`
               , { style: trans.inner}
               , [ ConfigControlsDOM
                 , ConfigInputDOM
                 ]
               )
             ]
           )
       )
