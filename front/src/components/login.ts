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

import { genButtonColors
       , genStylesheet 
       , genButton
       } from '../dom-helpers/button'

export interface Sources extends BaseSources {
  onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
  onion?: Stream<Reducer>
}

export interface Classes {
  outer: string
  inner: string
  userName: string
  passWord: string
  loginButton: string
}

export interface Transitions {
  outer: SnabbTransition | false
  inner: SnabbTransition | false
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
  ( { color }
    : { color: ColorPallete }
  ) =>
  stylesheet
  ( { outer:
      { fontSize: '1em'
      , height: '100%'
      , width: '100%'
      , backgroundImage: color.backgroundImage
      , backgroundSize: 'cover'
      , paddingTop: '2rem'
      , color: color.mainText
      }
    , inner:
      { fontSize: '1.5em'
      , padding: '.6em'
      , borderRadius: '.4rem'
      , marginLeft: 'auto'
      , marginRight: 'auto'
      , width: '90%'
      , maxWidth: '40rem'
      , backgroundColor: color.background
      }
    , userName:
      { fontSize: '1em'
      }
    , passWord:
      { fontSize: '1em'
      }
    , loginButton:
      { fontSize: '1em'
      }
    }
  )

// const wrapperTransition: Transition[] =
//   [ transition('opacity')(1, 1)
//   ]

export const LoginTransitions: Transitions =
 { outer: false
 , inner:
    snabbTransition
    ( [ transition('opacity', 1)('0', { add: '1', rem: '0'} ) ] )
 }

const loginButton =
  (buttonColor:string) =>
    genButton
    ( genStylesheet
      ( genButtonColors
        (buttonColor) 
      )
    )

const view = (css:Classes, trans:Transitions) =>
  (state$: Stream<State>): Stream<VNode> =>
    state$
      .map( ({ myNumber }) =>
        div
        ( `.${css.outer}`
        , { style: trans.outer}
        , [ div
            (`.${css.inner}`
            , { style: trans.inner}
            , [ div(`.${css.userName}`, 'userName:')
              , div(`.${css.passWord}`, 'passWord' )
              , div(`.${css.loginButton}`, 'login button')
              , loginButton('#7161ef')('normal')
              ]
            )
          ]
        )
      )
