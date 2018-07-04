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
  ( { outer:
      { fontSize: '1em'
      , height: '100%'
      , width: '100%'
      , backgroundImage: color.backgroundImage
      , backgroundSize: 'cover'
      , paddingTop: '2rem'
      , color: color.mainText
      , opacity: 1
      }
    , inner:
      { fontSize: '1.5em'
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

const wrapperTransition: Transition[] =
  [ transition('opacity')(1, 0)
  ]

export const LoginTransitions: Transitions =
 { wrapper: snabbTransition(wrapperTransition)
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
        , { style: trans.wrapper}
        , [ div
            (`.${css.inner}`
            , [ div(`.${css.userName}`, 'userName:')
              , div(`.${css.passWord}`, 'passWord' )
              , div(`.${css.loginButton}`, 'login button')
              , div
                ('Main Button for: #7161ef'
                , [ loginButton('#7161ef')('normal')
                  , loginButton('#7161ef')('disabled')
                  , loginButton('#7161ef')('warning')
                  , loginButton('#7161ef')('error')
                  , loginButton('#7161ef')('loading')
                  ]
                )
              , div
                ('Sub Button for: #f991cc'
                , [ loginButton('#f991cc')('normal')
                  , loginButton('#f991cc')('disabled')
                  , loginButton('#f991cc')('warning')
                  , loginButton('#f991cc')('error')
                  , loginButton('#f991cc')('loading')
                  ]
                )
              ]
            )
          ]
        )
      )
