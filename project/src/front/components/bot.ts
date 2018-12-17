import xs, { Stream } from 'xstream'
import { div
       , i
       , input
       , VNode
       , DOMSource 
       } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import { HTTPSource } from '@cycle/http'
import { ResponseCollection } from '@cycle/storage'
import sampleCombine from 'xstream/extra/sampleCombine'
// import isolate from '@cycle/isolate'
import { path
       , pathOr
       } from 'rambda'

import { style, stylesheet } from 'typestyle'
import * as csstips from 'csstips'

import { BaseSources, BaseSinks } from '../interfaces'
import { BackSource } from './../drivers/back'

import { ColorPallete } from '../utils/color-pallete'
import { transition
       , Transition
       , snabbTransition
       , SnabbTransition
       } from '../utils/snabb-transitions'

import { Button
       , ButtonState
       } from '../dom-helpers/button'

export interface Sources extends BaseSources {
  onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
  onion?: Stream<Reducer>
}

export type State =
  { stopStatus: ButtonState
  , startStatus: ButtonState
  , errorMessage: string
  , botStatus: string
  }

export const defaultState: State =
  { stopStatus: 'error'
  , startStatus: 'normal'
  , errorMessage: ''
  , botStatus: '...getting status'
  }

export type Reducer = (prev: State) => State | undefined

const initReducer = (defaultState:any) =>
  (prev:any) => ({...defaultState, ...prev})

export type Classes =
  { outer: string
  , inner: string
  , status: string
  , error: string
  , controls: string
  , stop: string
  , start: string
  }

export const Style = 
  ( { mainText
    , background
    } : ColorPallete
  ) =>
    stylesheet
    ( { outer:
        { fontSize: '1em'
        , color: mainText
        , height: '100%'
        , padding: '2em'
        , justifyContent: 'center'
        , alignItems: 'center'
        , ...csstips.vertical
        }
      , inner:
        { fontSize: '1em'
        , padding: '1em'
        , width: '90%'
        , maxWidth: '30rem'
        , borderRadius: '.4rem'
        , backgroundColor: background
        }
      , status:
        { fontSize: '3em'
        , padding: '1em'
        }
      , error:
        { fontSize: '.8em'
        }
      , controls:
        { fontSize: '1em'
        , justifyContent: 'space-between'
        , ...csstips.horizontal
        }
      , stop:
        { fontSize: '1em'
        , $nest:
          { 'i':
            { fontSize: '3em'
            }
          }
        }
      , start:
        { fontSize: '1em'
        , $nest:
          { 'i':
            { fontSize: '3em'
            }
          }
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
    ( [ transition('opacity', 1)('0', { add: '1', rem: '0'}) ] )
 }

export const Bot =
  (colors: ColorPallete) =>
    ({ DOM, onion, back}: Sources): Sinks => {
      const action =
        intent(DOM, back)
      const vdom$: Stream<VNode> =
        view
        ( Style(colors)
        , Transitions
        )(onion.state$)

      return { DOM: vdom$
             , onion: action.onion
             , back: action.back
             }
    }

const takeSecond =
  (arr:any[]) => arr[1]

const intent =
  ( DOM: DOMSource
  , back: BackSource
  ) => {
    const init$ = xs.of<Reducer>(
      initReducer(defaultState)
    )

    const subScribeStatus$ =
      xs.of({ TYPE: 'SUBSCRIBE_STATUS' })

    const botStatus$ =
      back
        .message('STATUS')
        .map<Reducer>
         ( ({ status }:any) =>
             (prev) => (
             { ...prev
             , botStatus: status
             }
           )
         )

    const startRequest$ =
      DOM
        .select('.start')
        .events('click')
        .mapTo({ TYPE: 'START'})

    const stopRequest$ =
      DOM
        .select('.stop')
        .events('click')
        .mapTo({TYPE: 'STOP'})

    const botError$ =
      xs.merge
         ( back.error('START')
         , back.error('STOP')
         , back.error('SUBSCRIBE_STATUS')
         )
        .map<Reducer>
         ( (errorMessage) =>
             (prev) => (
               { ...prev
               , errorMessage: errorMessage
               }
             )
         )

    return { onion:
               xs.merge
               ( init$
               , botStatus$
               , botError$
               )
           , back:
               xs.merge
                  ( subScribeStatus$
                  , startRequest$
                  , stopRequest$
                  )
           }
  }

const view = (css:Classes, trans:Transitions) =>
  (state$: Stream<State>): Stream<VNode> =>
    state$
      .map
       ( ( { stopStatus
           , startStatus
           , errorMessage
           , botStatus
           }
         ) =>
           div
           ( `.${css.outer}`
           , { style: trans.outer}
           , [ div
               (`.${css.inner}`
               , { style: trans.inner}
               , [ div(`.${css.status}`, botStatus)
                 , div(`.${css.error}`, errorMessage)
                 , div
                   ( `.${css.controls}`
                   , [ div
                       ( `.${css.stop}`
                       , Button
                         ('#ccc')
                         (stopStatus, i('.im.im-stop'), 'stop')
                       )
                     , div
                       ( `.${css.start}`
                       , Button
                         ('#0fd549')
                         (startStatus, i('.im.im-rocket'), 'start')
                       )
                     ]
                   )
                 ]
               )
             ]
           )
       )
