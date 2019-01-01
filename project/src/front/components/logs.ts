import xs, { Stream } from 'xstream'
import buffer from 'xstream/extra/buffer'
import { div
       , input
       , VNode
       , DOMSource 
       } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import { HTTPSource } from '@cycle/http'
import { BackSource } from './../drivers/back'
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

export interface Sources extends BaseSources {
  onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
  onion?: Stream<Reducer | {}>
}

export type State =
  { logs: string[]
  }


const testLogs =
  [ 'data1'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'data2'
  , 'dataEND'
  ]

export const defaultState: State =
  { logs:
      testLogs
    // [ 'Getting logs or something!'
    // , 'No logs appearing try to running the bot(click the rocket) on the bot page!'
    // ]
  }

export type Reducer = (prev: State) => State | undefined

const initReducer = (defaultState:any) =>
  (prev:any) => ({...defaultState, ...prev})

export type Classes =
  { outer: string
  , inner: string
  , logs: string
  , logLine: string
  }

export const Style = 
  ( { mainText
    , subText
    , background
    } : ColorPallete
  ) =>
    stylesheet
    ( { outer:
        { fontSize: '1em'
        , color: mainText
        , height: '100%'
        , padding: '5%'
        }
      , inner:
        { fontSize: '1em'
        , padding: '1em'
        , width: '100%'
        , height: '100%'
        , borderRadius: '.4rem'
        , backgroundColor: background
        }
      , logs:
        { fontSize: '1em'
        , padding: '.4em'
        , color: subText
        , background: '#06011d'
        , borderRadius: '.2rem'
        , overflowY: 'scroll'
        , height: '100%'
        , width: '100%'
        }
      , logLine:
        { fontSize: '1em'
        , bottomBorderStyle: 'solid'
        } }
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

export const Logs =
  (colors: ColorPallete) =>
    ({ DOM, onion, back}: Sources): Sinks => {
      const action$ =
        intent(DOM, back)
      const vdom$: Stream<VNode> =
        view
        ( Style(colors)
        , Transitions
        )(onion.state$)

      return { DOM: vdom$
             , onion: action$.onion
             , back: action$.back
             }
    }

const takeSecond =
  (arr:any[]) => arr[1]

const couldNotRetrieveAnswer =
  [ 'Could not retrieve logs!'
  , 'Could not retrieve logs!'
  , 'Could not retrieve logs!'
  , 'Could not retrieve logs!'
  , 'Could not retrieve logs!'
  , 'Could not retrieve logs!'
  , 'Could not retrieve logs!'
  ]

const intent =
  ( DOM: DOMSource
  , back: BackSource
  ) => {
    const init$ = xs.of<Reducer>(
      initReducer(defaultState)
    )

    const subscribeLogs$ =
      xs.of({TYPE: 'SUBSCRIBE_LOGS'})

    const logs$ =
      back
        .message('LOG')

    const resetLogs$ =
      subscribeLogs$
        .mapTo<Reducer>((prev) => ({...prev, logs: []}))

    const bufferStream$ =
      xs.periodic(100)

    const updateLog$ =
      logs$
        .map(path('log'))
        .compose(buffer(bufferStream$))
        .map<Reducer>
         ( (logs:any) =>
             (prev) => (
               { ...prev
               , logs: [...prev.logs, ...logs]
               }
             )
         )

    return { onion:
               xs.merge
               ( init$
               , resetLogs$
               , updateLog$
               )
           , back: subscribeLogs$
           }
  }

const view = (css:Classes, trans:Transitions) =>
  (state$: Stream<State>): Stream<VNode> =>
    state$
      .map
       ( ( { logs
           }
         ) =>
           div
           ( `.${css.outer}`
           , { style: trans.outer}
           , [ div
               (`.${css.inner}`
               , { style: trans.inner}
               , div
                 ( `.${css.logs}`
                 , logs
                     .map
                      ( (logLine: string) => div(`.${css.logLine}`, logLine))
                 )
               // , div(`.${css.elem}`, `The answer, ${myNumber}`)
               )
             ]
           )
       )
