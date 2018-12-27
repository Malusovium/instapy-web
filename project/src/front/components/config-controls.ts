import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { div
       , i
       , input
       , VNode
       , DOMSource 
       } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
// import isolate from '@cycle/isolate'
import { path, map } from 'rambda'

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
  onion?: Stream<Reducer>
}

export type State =
  { init: any
  , end: any
  , middle: any
  }

export const defaultState: State =
  { init:
    {}
  , end:
    {}
  , middle: []
  }

export type Reducer = (prev: State) => State | undefined

const initReducer = (defaultState:any) =>
  (prev:any) => ({...defaultState, ...prev})

export type Classes =
  { outer: string
  , inner: string
  , button: string
  }

export const Style = 
  ( { mainText
    , mainButton
    } : ColorPallete
  ) =>
    stylesheet
    ( { outer:
        { fontSize: '1em'
        // , padding: '2em'
        , color: mainText
        }
      , inner:
        { fontSize: '1em'
        , borderRadius: '.4em'
        , padding: '.2em'
        , backgroundColor: mainButton
        , justifyContent: 'space-around'
        , ...csstips.horizontal
        }
      , button:
        { fontSize: '1em'
        , padding: '.4em'
        , cursor: 'pointer'
        , borderRadius: '.2em'
        , paddingBottom: '.2em'
        , paddingTop: '.6em'
        , margin: 0
        , color: 'white'
        , backgroundColor: 'rgba(255,255,255, .1)'
        , $nest:
          { '> i':
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
    ( [ transition('opacity', 1)('0', { add: '1', rem: '0'} ) ] )
 }

export const ConfigControls =
  (colors: ColorPallete) =>
    ({ DOM, onion, back}: Sources): Sinks => {
      const actions = intent(DOM, onion.state$, back)
      const vdom$: Stream<VNode> =
        view
        ( Style(colors)
        , Transitions
        )(onion.state$)

      return (
        { DOM: vdom$
        , onion: actions.onion
        , back: actions.back
        }
      )
    }

const extractData =
  ({ name, value }) => (
    { name: name
    , args: value
    }
  )

const intent = (DOM: DOMSource, state$: any, back: any): Stream<Reducer> => {
  const init$ = xs.of<Reducer>(
    initReducer(defaultState)
  )

  const config$ =
    back
      .message('CONFIG')
      .debug('dit something')
      .map(path('config'))
      .map
       ( ({init, end, middle}) =>
           (prev) => (
             { ...prev
             , init: init
             , end: end
             , middle: middle
             }
           )
       )

  const refreshGet$ =
    DOM
      .select('.refresh')
      .events('click')
      .mapTo({TYPE: 'GET_CONFIG'})

  const build$ =
    DOM
      .select('.build')
      .events('click')
      .compose(sampleCombine(state$))
      .map( ([_, state]) => state )
      .map
       ( ({ init, end, middle }) =>
         [ extractData(init)
         , ...map(extractData, middle)
         , extractData(end)
         ]
       )
      .map
       ( (data) => (
           { TYPE: 'BUILD'
           , DATA: data
           }
         )
       )
      // .mapTo({TYPE: 'GET_CONFIG'})

  const save$ =
    DOM
      .select('.save')
      .events('click')
      .compose(sampleCombine(state$))
      .map( ([_, state]) => state )
      .map
       ( ({ init, end, middle }) => (
           { TYPE: 'SAVE_CONFIG'
           , DATA:
             { config:
               { init: init
               , end: end
               , middle: middle
               }
             }
           }
         )
       )

  return (
    { onion: xs.merge(init$, config$)
    , back: xs.merge(refreshGet$, save$, build$)
    }
  )
}

const view = (css:Classes, trans:Transitions) =>
  (state$: Stream<State>): Stream<VNode> =>
    state$
      .map
       ( ( { 
           }
         ) =>
           div
           ( `.${css.outer}`
           , { style: trans.outer}
           , [ div
               (`.${css.inner}`
               , { style: trans.inner}
               , [ div
                   ( { class:
                       { [css.button]: true
                       , 'refresh': true
                       }
                     }
                   , i('.im.im-undo')
                   )
                 , div
                   ( { class:
                       { [css.button]: true
                       , 'build': true
                       }
                     }
                   , i('.im.im-gear')
                   )
                 , div
                   ( { class:
                       { [css.button]: true
                       , 'save': true
                       }
                     }
                   , i('.im.im-save')
                   )
                 ]
               )
             ]
           )
       )
