import xs, { Stream } from 'xstream'
import { div
       , i
       , input
       , VNode
       , DOMSource 
       } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'
import { ResponseCollection } from '@cycle/storage'
// import isolate from '@cycle/isolate'

import { style, stylesheet } from 'typestyle'
import { color, rgb } from 'csx'
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
  { showItems: boolean
  , token: string
  }

export const defaultState: State =
  { showItems: false
  , token: ''
  }

export type Reducer = (prev: State) => State | undefined

const initReducer = (defaultState:any) =>
  (prev:any) => ({...defaultState, ...prev})

export interface Classes {
  outer: string
  inner: string
  menu: string
  itemWrapper: string
  burger: string
  item: string
  logo: string
  spacer: string
  divider: string
  logout: string
  content: string
}

export const Style = 
  ( { mainText
    , subButton
    , backgroundImage
    , icon
    } : ColorPallete
  ) =>
    stylesheet
    ( { outer:
        { fontSize: '1em'
        , color: mainText
        , fontFamily: `'Roboto', sans-serif`
        , height: '100%'
        , width: '100%'
        }
      , inner:
        { fontSize: '1em'
        , backgroundImage: backgroundImage
        , ...csstips.fillParent
        , ...csstips.vertical
        }
      , menu:
        { fontSize: '1em'
        , padding: '.2rem'
        , backgroundColor:
            color(subButton)
              .darken(.2)
              .fade(.3)
              .toRGBA()
              .toString()
        , justifyContent: 'center'
        , ...csstips.horizontal
        }
      , itemWrapper:
        { fontSize: '1em'
        , backgroundColor:
            color(subButton)
              .darken(.2)
              .fade(.3)
              .toRGBA()
              .toString()
        , color: 'white'
        , fontWeight: 300
        , padding: '.4em'
        , ...csstips.fillParent
        , ...csstips.vertical
        }
      , item:
        { fontSize: '1.4em'
        , color: 'white'
        , textAlign: 'center'
        , padding: '.8em'
        , cursor: 'pointer'
        , ...csstips.content
        , $nest:
          { '&:hover':
            { backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }
        }
      , burger:
        { fontSize: '1em'
        , padding: '1em'
        , color: 'white'
        , cursor: 'pointer'
        , ...csstips.content
        , $nest:
          { '> i': {fontSize: '3.2em'}
          }
        }
      , logo:
        { backgroundImage: icon
        , padding: '1.4rem'
        , flex: 99
        // , alignSelf: 'center'
        , backgroundPosition: 'center center'
        , backgroundRepeat: 'no-repeat'
        , ...csstips.content
        }
      , spacer:
        { flex: 9
        }
      , divider:
        { minHeight: '2px'
        , boxShadow: '0 .2rem .2rem #ccc'
        }
      , logout:
        { fontSize: '1.4em'
        , textAlign: 'center'
        , padding: '.8em'
        , cursor: 'pointer'
        , ...csstips.content
        , $nest:
          { '&:hover':
            { backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }
          }
        }
      , content:
        { fontSize: '1em'
        , background: 'rgba(255, 255, 255, 0.1)'
        , overflowY: 'scroll'
        , ...csstips.flex
        }
      }
    )

export const Transitions: Transitions =
 { outer: false
 , inner:
    snabbTransition
    ( [ transition('opacity', 1)('0', { add: '1', rem: '0'} ) ] )
 }

export const MainMenu =
  (colors: ColorPallete) =>
    ({ DOM, onion, storage}: Sources): Sinks => {
      const action$ = intent(DOM, storage)
      const vdom$: Stream<VNode> =
        view
        ( Style(colors)
        , Transitions
        )(onion.state$)

      return { DOM: vdom$
             , onion: action$.onion
             , router: action$.router
             }
    }

const intent =
  ( DOM: DOMSource
  , storage: ResponseCollection
  ) => {
    const init$ = xs.of<Reducer>(
      initReducer(defaultState)
    )

    const open$ =
      DOM
        .select('.open')
        .events('click')
        .mapTo<Reducer>
        ( (prev) => (
            { ...prev
            , showItems: true
            }
          )
        )

    const close$ =
      DOM
        .select('.close')
        .events('click')
        .mapTo<Reducer>
        ( (prev) => (
            { ...prev
            , showItems: false
            }
          )
        )

    const logoutClick$ =
      DOM
        .select('.logout')
        .events('click')

    const changeLogin$ =
      logoutClick$
        .mapTo('/login')

    const token$ =
      storage
        .session
        .getItem('jwt-token')
        .map<Reducer>
         ( (token:string) =>
             (prev) =>  (
               { ...prev
               , token
               }
             )
         )

    return { onion: xs.merge(init$, token$, open$, close$)
           , router: xs.merge(changeLogin$)
           }
  }

const menuItems =
  (css: Classes) =>
    div
    ( `.${css.itemWrapper}`
    , [ div(`.${css.spacer}`, '')
      , div(`.${css.item}.bot`, 'Bot')
      , div(`.${css.divider}`, '')
      , div(`.${css.item}.config`, 'Config')
      , div(`.${css.divider}`, '')
      , div(`.${css.item}.logs`, 'Logs')
      , div(`.${css.spacer}`, '')
      , div(`.${css.logout}.logout`, 'Logout')
      ]
    )



const view = (css:Classes, trans:Transitions) =>
  (state$: Stream<State>): Stream<VNode> =>
    state$
      .map
       ( ( { showItems
           , token
           }
         ) =>
           div
           ( `.${css.outer}`
           , { style: trans.outer}
           , [ div
               (`.${css.inner}`
               , { style: trans.inner}
               , [ div
                   ( `.${css.menu}`
                   , [ div(`.${css.logo}`)
                     // , menuItems(css)
                     , showItems
                        ? div(`.${css.burger}.close`, i('.im.im-x-mark'))
                        : div(`.${css.burger}.open`, i('.im.im-menu'))
                     ]
                   )
                 , showItems
                    ? menuItems(css)
                    : div(`.${css.content}`, 'content')
                 ]
               )
             ]
           )
       )
