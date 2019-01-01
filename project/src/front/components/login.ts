import xs, { Stream } from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { div
       , input
       , VNode
       , DOMSource 
       } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import { HTTPSource } from '@cycle/http'
import isolate from '@cycle/isolate'
import { StorageRequest } from '@cycle/storage'
import { BackSource } from './../drivers/back'

import { propEq
       , pick
       , path
       , pluck
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

import { InputText
       , State as InputTextState
       } from './input-text'

export interface Sources extends BaseSources {
  onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
  onion?: Stream<Reducer | {}>
}

export interface Transitions {
  outer: SnabbTransition | false
  inner: SnabbTransition | false
}

export type State =
  { buttonState: ButtonState
  , errorMessage: string | false
  , userName: InputTextState
  , passWord: InputTextState
  }

export const defaultState: State =
  { buttonState: 'normal'
  , errorMessage: false
  , userName:
    { labelText: 'Username'
    , value: ''
    }
  , passWord:
    { labelText: 'Password'
    , type: 'password'
    , value: ''
    }
  }

export type Reducer = (prev: State) => State | undefined

const initReducer = (defaultState:any) =>
  (prev:any) => ({...defaultState, ...prev})

export type Classes =
  { outer: string
  , inner: string
  , logo: string
  , logoText: string
  , userName: string
  , passWord: string
  , error: string
  }

export const LoginStyle = 
  ( { backgroundImage
    , background
    , mainText
    , icon
    } : ColorPallete
  ) =>
    stylesheet
    ( { outer:
        { fontSize: '.8em'
        , fontFamily: `'Roboto', sans-serif`
        , height: '100%'
        , width: '100%'
        , backgroundImage: backgroundImage
        , backgroundSize: 'cover'
        , paddingTop: '2em'
        , color: mainText
        , position: 'fixed'
        , overflowY: 'scroll'
        , ...csstips.vertical
        , alignItems: 'center'
        , justifyContent: 'center'
        }
      , inner:
        { fontSize: '1.5em'
        , padding: '1em'
        , borderRadius: '.4rem'
        , marginLeft: 'auto' , marginRight: 'auto'
        , width: '90%'
        , maxWidth: '24rem'
        , boxShadow: '0 0 20em 1em #d8a'
        , backgroundColor: background , ...csstips.vertical
        , ...csstips.content
        , $nest:
          { '> div':
            { marginBottom: '1.4rem' }
          }
        }
      , logo:
        { backgroundImage: icon
        , backgroundPosition: 'center center'
        , backgroundRepeat: 'no-repeat'
        , height: '6em'
        }
      , logoText:
        { fontSize: '1.4em'
        , fontWeight: 300
        , textAlign: 'center'
        }
      , userName:
        { fontSize: '1em'
        }
      , passWord:
        { fontSize: '1em'
        }
      , error:
        { fontSize: '.6em'
        }
      }
    )

export const LoginTransitions: Transitions =
 { outer: false
 , inner:
    snabbTransition
    ( [ transition('opacity', 1)('0', { add: '1', rem: '0'} ) ] )
 }

export const Login = (colors: ColorPallete) =>
  ({ DOM, onion, HTTP, back}: Sources): Sinks => {
    const userName$ =
      isolate
      ( InputText(colors)
      , 'userName'
      )({ DOM, onion })

    const passWord$ =
      isolate
      ( InputText(colors)
      , 'passWord'
      )({ DOM, onion })

    const action$ =
      intent
      ( DOM
      , onion.state$
      , back
      )
    const vdom$: Stream<VNode> =
      view
      ( LoginStyle(colors)
      , LoginTransitions
      )
      ( onion.state$
      , userName$.DOM
      , passWord$.DOM
      )

    return (
      { DOM: vdom$
      , onion:
         xs.merge
         ( action$.onion
         , userName$.onion
         , passWord$.onion
         )
      // , storage: action$.storage
      // , router: action$.router
      , back: action$.back
      }
    )
  }

const takeSecond =
  (arr:any[]) => arr[1]

const intent =
  ( DOM: DOMSource
  , state$: Stream<State>
  , back: BackSource
  ) => {
    const init$ =
      xs.of<Reducer>
      ( initReducer(defaultState) )

    const loginClick$ =
      DOM
        .select('button')
        .events('click')

    const loginLoading$ =
      loginClick$
        .mapTo<Reducer>
         ( (prev) => (
             { ...prev
             , buttonState: 'loading'
             , errorMessage: false
             }
           )
         )

    const loginRequest$ =
      loginClick$
        .compose(sampleCombine(state$))
        .map(takeSecond)
        .filter(propEq('buttonState', 'normal'))
        .map(pick(['userName', 'passWord']))
        .map(pluck('value'))
        .map
         ( ([ userName, passWord ]) => (
             { TYPE: 'LOGIN'
             , DATA:
               { userName: userName
               , passWord: passWord
               }
             }
           )
         )

    const loginError$ =
      back.error('LOGIN')

    const loginSucces$ =
      back.succes('LOGIN')

    const connectError$ =
      back.error('CONNECT')

    const normalButton$ =
      xs.merge
         ( loginError$
         , loginSucces$
         , connectError$
         )
        .mapTo<Reducer>
         ( (prev) => ({...prev, buttonState: 'normal'}))

    const errorMessage$ =
      loginError$
        .map<Reducer>
         ( (message: string) =>
             (prev) => (
               { ...prev
               , errorMessage: message
               }
             )
         )

    const clearUserCredentials$ =
      loginSucces$
        .mapTo<Reducer>
         ( (prev) => (
             { ...prev
             , userName:
               { ...prev.userName
               , value: ''
               }
             , passWord:
               { ...prev.passWord
               , value: ''
               }
             }
           )
         )

    return (
      { onion:
          xs.merge
          ( init$
          , loginLoading$
          , normalButton$
          , errorMessage$
          , clearUserCredentials$
          )
      , router: xs.of()
      // , router: xs.merge(changeRoute$)
      , storage: xs.of()
      // , storage: xs.merge(loginToken$)
      , back: xs.merge(loginRequest$)
      }
    )
  }

const view = (css:Classes, trans:Transitions) =>
  (state$: Stream<State>, ...components: Stream<VNode>[]): Stream<VNode> =>
    xs.combine(state$, ...components)
      .map
       ( ( [ { buttonState
             , errorMessage
             }
           , userName
           , passWord
           ]
         ) =>
           div
           ( `.${css.outer}`
           , { style: trans.outer}
           , [ div
               (`.${css.inner}`
               , { style: trans.inner}
               , [ div(`.${css.logo}`)
                 , div(`.${css.logoText}`, 'Instapy-Web')
                 , userName
                 , passWord
                 , (errorMessage)
                     ? div(`.${css.error}`, errorMessage)
                     : undefined
                 , Button('#7161ef')(buttonState, 'Login')
                 ]
               )
             ]
           )
       )
