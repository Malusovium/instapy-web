import xs, { Stream } from 'xstream'
import { div
       , i
       , VNode
       , DOMSource 
       } from '@cycle/dom'
import { StateSource } from 'cycle-onionify'

import { style, stylesheet } from 'typestyle'
import * as csstips from 'csstips'

import { BaseSources, BaseSinks } from '../interfaces'

import { ColorPallete } from '../utils/color-pallete'
import { transition
       , Transition
       , snabbTransition
       , SnabbTransition
       } from '../utils/snabb-transitions'

import
  { omit
  , path
  , compose
  , map
  , range
  , zip
  } from 'rambda'

export interface Sources extends BaseSources {
  onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
  onion?: Stream<Reducer>
}

export type State =
  { arr: any[]
  , pickList: string[]
  , isOpen: boolean
  , addFn: (value: string) => any
  }

export const defaultState: State =
  { arr: []
  , isOpen: false
  , pickList: []
  , addFn: (value) => value
  }

export type Reducer = (prev: State) => State | undefined

const initReducer = (defaultState:any) =>
  (prev:any) => ({...defaultState, ...prev})

export const addButtonLens =
  (arrKey: string, buttonKey: string) => (
    { get:
        (state) => (
          { arr: state[arrKey]
          , ...state[buttonKey]
          }
        )
    , set:
        (state, childState) => (
          { ...state
          , [arrKey]: childState['arr']
          , [buttonKey]: omit('arr', childState)
          }
        )
    }
  )

export type Classes =
  { wrapper: string
  , button: string
  , pickList: string
  }

export const Style = 
  ( { mainText
    , mainButton
    } : ColorPallete
  ) =>
    stylesheet
    ( { wrapper:
        { fontSize: '1em'
        , paddingBottom: '.6em'
        , justifyContent: 'center'
        , ...csstips.horizontal
        }
      , openList:
        { position: 'absolute'
        , zIndex: '99'
        , top: 0
        , bottom: 0
        , left: 0
        , right: 0
        }
      , button:
        { fontSize: '4em'
        , paddingLeft: '.1em'
        , height: '1em'
        , width: '1em'
        , color: 'white'
        , cursor: 'pointer'
        , borderRadius: '.1em'
        , background: mainButton
        , $nest:
          { '> i':
            { fontSize: '.8em'
            }
          }
        }
      , pickList:
        { position: 'absolute'
        , color: 'white'
        , top: '10%'
        , bottom: '10%'
        , overflowY: 'scroll'
        , padding: '.5em'
        , background: 'rgba(0,115,140, 0.9)'
        }
      , pickItem:
        { fontSize: '1.2em'
        , padding: '.1em'
        , marginBottom: '1px'
        , background: 'rgba(255, 255, 255, 0.3)'
        }
      , closeList:
        { position: 'absolute'
        , background: 'rgba(0,0,0,0.7)'
        , top: 0
        , left: 0
        , right: 0
        , bottom: 0
        }
      , none:
        { display: 'none'
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

export const AddButton =
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
  const init$ = xs.of<Reducer>(
    initReducer(defaultState)
  )

  const open$ =
    DOM
      .select('[data-open]')
      .events('click')
      .mapTo
       ( (prev) => ({ ...prev, isOpen: true })
       )

  const closeClick$ =
    DOM
      .select('[data-close]')
      .events('click')

  const pick$ =
    DOM
      .select('[data-pick]')
      .events('click')

  const add$ =
    pick$
      .map(path('target.dataset.index'))
      .map
       ( (index) =>
           (prev) => (
             { ...prev
             , arr:
               [ ...prev.arr
               , { name: prev.pickList[index]
                 , order: prev.arr.length
                 }
               ]
             }
           )
       )

  const close$ =
    xs.merge
       ( pick$
       , closeClick$
       )
      .mapTo
       ( (prev) => ({ ...prev, isOpen: false })
       )

  return xs.merge(init$, open$, add$, close$)
}

const pickListItem =
  (pickItemClass) =>
    (value: string, index: number) =>
      div
      ( { dataset:
          { pick: true
          , index: `${index}`
          }
        , class:
          { [pickItemClass]: true
          }
        }
      , value
      )

const iMap =
  (fn: any) =>
    (arr:any[]) =>
      compose
      ( map(([index, value]) => fn(value, index))
      , zip(range(0, arr.length))
      )(arr)

const view = (css:Classes, trans:Transitions) =>
  (state$: Stream<State>): Stream<VNode> =>
    state$
      .map
       ( ( { pickList
           , isOpen
           }
         ) =>
           div
           ( { class:
               { [css.wrapper]: true
               , [css.openList]: isOpen
               }
             }
           , [ div
               ( { dataset:
                   { close: true
                   }
                 , class:
                   { [css.closeList]: true
                   , [css.none]: !isOpen
                   }
                 }
               )
             , isOpen
                 ? div
                   ( `.${css.pickList}`
                   , iMap(pickListItem(css.pickItem)) (pickList)
                   )
                 : div
                   ( `.${css.button}`
                   , { dataset: { open: true } }
                   , i('.im.im-plus')
                   )
             ]
           )
       )
