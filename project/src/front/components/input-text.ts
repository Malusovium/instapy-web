import xs, { Stream } from 'xstream'
import { div
       , input
       , label
       , VNode
       , DOMSource 
       } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
// import isolate from '@cycle/isolate'

import { path } from 'rambda'
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

export interface Transitions {
  outer: SnabbTransition | false
  inner: SnabbTransition | false
}

export type State =
  { labelText: string
  , type: 'text' | 'password'
  , value: string
  }

export const defaultState: State =
  { labelText: 'label'
  , type: 'text'
  , value: ''
  }

export type Reducer = (prev: State) => State | undefined

const initReducer = (defaultState:any) =>
  (prev:any) => ({...defaultState, ...prev})

export type Classes =
  { outer: string
  , inner: string
  , label: string
  , input: string
  }

export const Style = 
  ( { mainText
    , subText
    , mainButton
    } : ColorPallete
  ) =>
    stylesheet
    ( { outer:
        { fontSize: '1em'
        , color: mainText
        }
      , inner:
        { fontSize: '1em'
        , display: 'flex'
        , ...csstips.vertical
        }
      , label:
        { fontSize: '.8em'
        , color: subText
        , paddingBottom: '.4rem'
        }
      , input:
        { fontSize: '1em'
        , color: mainText
        , padding: '.2em'
        , borderRadius: '.2rem'
        , borderStyle: 'none'
        , boxShadow: `0 .2rem 0 0 ${subText}`
        , $nest:
          { '&:hover':
            { boxShadow: `0 .2rem 0 0 ${mainButton}`
            }
          , '&:focus':
            { boxShadow: `0 0 0 .2rem ${mainButton}`
            }
          }
        }
      }
    )

export const Transitions: Transitions =
 { outer: false
 , inner:
    snabbTransition
    ( [ transition('opacity', 1)('0', { add: '1', rem: '0'} ) ] )
 }

export const InputText =
  (colors: ColorPallete) =>
    ({ DOM, onion}: Sources): Sinks => {
      const action$: Stream<Reducer> = intent(DOM)
      const vdom$: Stream<VNode> =
        view
        ( Style(colors)
        , Transitions
        )(onion.state$)

      return { DOM: vdom$
             , onion: action$
             }
    }

const intent = (DOM: DOMSource): Stream<Reducer> => {
  const init$ =
    xs.of<Reducer>
    ( initReducer(defaultState) )

  const input$ =
    DOM
      .select('input')
      .events('input')
      .map(path('target.value'))
      .debug('value')
      .map<Reducer>
       ( (value:string) =>
           (prev) => (
             { ...prev
             , value
             }
           )
       )

  return xs.merge(init$, input$)
}

const view = (css:Classes, trans:Transitions) =>
  (state$: Stream<State>): Stream<VNode> =>
    state$
      .map
       ( ( { labelText
           , type
           , value
           }
         ) =>
           div
           ( `.${css.outer}`
           , { style: trans.outer}
           , [ div
               (`.${css.inner}`
               , { style: trans.inner}
               , [ label(`.${css.label}`, labelText)
                 , input(`.${css.input}`, { props: { value: value, type: type} })
                 ]
               )
             ]
           )
       )
