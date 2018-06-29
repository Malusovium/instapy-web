import xs, { Stream } from 'xstream'
import { div
       , input
       , VNode
       , DOMSource 
       } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
// import isolate from '@cycle/isolate'

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

export interface Classes {
  wrapper: string
}

export interface Transitions {
  wrapper?: SnabbTransition
}

export interface State{
  myNumber: number
}

export const defaultState: State =
  { myNumber: 42
  }

export type Reducer = (prev: State) => State | undefined

const initReducer = (defaultState:any) =>
  (prev:any) => ({...defaultState, ...prev})

export const Login = (css:Classes, trans:Transitions) =>
  ({ DOM, onion}: Sources): Sinks => {
    const action$: Stream<Reducer> = intent(DOM)
    const vdom$: Stream<VNode> = view(css, trans)(onion.state$)

    return { DOM: vdom$
           , onion: action$
           }
  }

const intent = (DOM: DOMSource): Stream<Reducer> => {
  const init$ = xs.of<Reducer>(
    initReducer(defaultState)
  )

  return xs.merge(init$)
}

export const LoginStyle = 
  ( { color
    }
    : { color: ColorPallete
      }
    // : ColorPallete
  ) =>
  stylesheet
  ( { wrapper:
      { fontSize: '1em'
      , color: color.mainText
      , opacity: 1
      }
    }
  )

const wrapperTransition: Transition[] =
  [ transition('opacity')(1, 0)
  ]

export const LoginTransitions: Transitions =
 { wrapper: snabbTransition(wrapperTransition)
 }

const view = (css:Classes, trans:Transitions) =>
  (state$: Stream<State>): Stream<VNode> =>
    state$
      .map( ({ myNumber }) =>
        div( `.${css.wrapper}`
           , { style: trans.wrapper}
           , myNumber
           )
      )
