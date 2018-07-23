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
        , boxShadow: '0 0 20em 4em #d8a'
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
  ({ DOM, onion, HTTP}: Sources): Sinks => {
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
      , HTTP
      )
    const vdom$: Stream<VNode> =
      view
      ( LoginStyle(colors)
      , LoginTransitions
      )( onion.state$
       , userName$.DOM
       , passWord$.DOM
       )

    return { DOM: vdom$
           , onion:
              xs.merge
              ( action$.onion
              , userName$.onion
              , passWord$.onion
              )
           , HTTP: action$.HTTP
           , storage: action$.storage
           , router: action$.router
           }
  }

const takeSecond =
  (arr:any[]) => arr[1]

const intent =
  ( DOM: DOMSource
  , state$: Stream<State>
  , HTTP: HTTPSource
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
        .debug('this')
        .filter(propEq('buttonState', 'normal'))
        .debug('this two')
        .map(pick(['userName', 'passWord']))
        .map(pluck('value'))
        .map
         ( ([ userName, passWord ]) => (
             { url: `${process.env.BACK_URL}/api/login`
             , category: 'login'
             , method: 'POST'
             , send:
               { data:
                 { userName
                 , passWord
                 }
               }

             }
           )
         )

    const loginResponse$ =
      HTTP
        .select('login')
        .flatten()
        .map(path('body'))

    const loginNormal$ =
      loginResponse$
        .mapTo<Reducer>
         ( (prev) => ({...prev, buttonState: 'normal'}))

    const loginError$ =
      loginResponse$
        .filter(path('error'))
        .map<Reducer>
         ( ({error}) =>
             (prev) => (
               { ...prev
               , errorMessage: error
               }
             )
         )

    const loginToken$ =
      loginResponse$
        .filter(path('token'))
        .map<StorageRequest>
         ( ({token}) => (
             { target: 'session'
             , key: 'jwt-token'
             , value: token 
             }
           )
         )

    const clearUserCredentials$ =
      loginToken$
        .mapTo
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

    const changeRoute$ =
      loginToken$
        .mapTo('/bot')

    return { onion:
              xs.merge
              ( init$
              , loginLoading$
              , loginNormal$
              , loginError$
              , clearUserCredentials$
              )
           , HTTP: xs.merge(loginRequest$)
           , router: xs.merge(changeRoute$)
           , storage: xs.merge(loginToken$)
           }
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
