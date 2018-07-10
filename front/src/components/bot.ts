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
    ({ DOM, onion, storage, HTTP}: Sources): Sinks => {
      const action$ =
        intent(DOM, storage, HTTP)
      const vdom$: Stream<VNode> =
        view
        ( Style(colors)
        , Transitions
        )(onion.state$)

      return { DOM: vdom$
             , onion: action$.onion
             , HTTP: action$.HTTP
             }
    }

const takeSecond =
  (arr:any[]) => arr[1]

const intent =
  ( DOM: DOMSource
  , storage: ResponseCollection
  , HTTP: HTTPSource
  ) => {
    const init$ = xs.of<Reducer>(
      initReducer(defaultState)
    )

    const token$ =
      storage
        .session
        .getItem('jwt-token')

    const botStatusRequest$ =
      xs.periodic(1000)
        .compose(sampleCombine(token$))
        .map(takeSecond)
        .debug('token')
        .map
         ( (token: string) => (
             { url: `${process.env.BACK_URL}/api/bot-status`
             , category: 'status'
             , headers:
               { Authorization: `Bearer ${token}`
               }
             , method: 'GET'
             }
           )
         )

    const botStatusResponse$ =
      HTTP
        .select('status')
        .flatten()
        .map(path('body.status'))
        .map<Reducer>
         ( (status: string) =>
             (prev) => (
             { ...prev
             , botStatus: status
             }
           )
         )

    const botStartRequest$ =
      DOM
        .select('.start')
        .events('click')
        .compose(sampleCombine(token$))
        .map(takeSecond)
        .map
         ( (token: string) => (
             { url: `${process.env.BACK_URL}/api/bot-start`
             , category: 'start'
             , headers:
               { Authorization: `Bearer ${token}`
               }
             , method: 'GET'
             }
           )
         )

    const botStopRequest$ =
      DOM
        .select('.stop')
        .events('click')
        .compose(sampleCombine(token$))
        .map(takeSecond)
        .map
         ( (token: string) => (
             { url: `${process.env.BACK_URL}/api/bot-stop`
             , category: 'stop'
             , headers:
               { Authorization: `Bearer ${token}`
               }
             , method: 'GET'
             }
           )
         )

    const botErrorResponse$ =
      xs.merge
      ( HTTP.select('stop')
      , HTTP.select('start')
      ).flatten()
        .map(pathOr(' ', ['body', 'error']))
        .map<Reducer>
         ( (status: string) =>
             (prev) => (
               { ...prev
               , errorMessage: status
               }
             )
         )

    return { onion:
               xs.merge
               ( init$
               , botStatusResponse$
               , botErrorResponse$
               )
           , HTTP:
               xs.merge
               ( botStatusRequest$
               , botStartRequest$
               , botStopRequest$
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
