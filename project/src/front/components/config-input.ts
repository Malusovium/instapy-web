import xs, { Stream } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import { div
       , input
       , VNode
       , DOMSource 
       } from '@cycle/dom'
import { StateSource, makeCollection } from 'cycle-onionify'
import isolate from '@cycle/isolate'

import { style, stylesheet } from 'typestyle'
import * as csstips from 'csstips'

import
  { pick
  , path
  , equals
  , map
  , sort
  , values
  , filter
  , compose
  , isNil
  , complement
  } from 'rambda'

import { BaseSources, BaseSinks } from '../interfaces'

import { ColorPallete } from '../utils/color-pallete'
import { iMap } from '../utils/imap'
import { transition
       , Transition
       , snabbTransition
       , SnabbTransition
       } from '../utils/snabb-transitions'

import { api } from 'instapy-tools'
import { Arg } from './instapy-method/arg'
import { method } from './instapy-method/method'
import { InstapyMethodWrapper } from './instapy-method-wrapper'
import { AddButton, addButtonLens } from './add-button'

const { raw, setupInterface } = api

export interface Sources extends BaseSources {
  onion: StateSource<State>
}
export interface Sinks extends BaseSinks {
  onion?: Stream<Reducer>
}

type Methods =
  any[]

export type State =
  { middle: Methods
  , init: any
  , end: any
  , addButton: any
  }

const dynamicMethods =
  [ 'clarifai_check_img_for'
  , 'comment_by_locations'
  , 'follow_by_list'
  , 'follow_by_tags'
  , 'follow_commenters'
  , 'follow_likers'
  , 'follow_user_followers'
  , 'follow_user_following'
  , 'get_instapy_logger'
  , 'interact_by_URL'
  , 'interact_by_users'
  , 'interact_user_followers'
  , 'interact_user_following'
  , 'like_by_feed'
  , 'like_by_locations'
  , 'like_by_tags'
  , 'like_by_users'
  , 'like_from_image'
  , 'login'
  , 'set_blacklist'
  , 'set_comments'
  , 'set_delimit_commenting'
  , 'set_delimit_liking'
  , 'set_do_comment'
  , 'set_do_follow'
  , 'set_do_like'
  , 'set_dont_include'
  , 'set_dont_like'
  , 'set_dont_unfollow_active_users'
  , 'set_ignore_if_contains'
  , 'set_ignore_users'
  , 'set_mandatory_words'
  , 'set_relationship_bounds'
  , 'set_selenium_local_session'
  , 'set_selenium_remote_session'
  , 'set_simulation'
  , 'set_sleep_reduce'
  , 'set_smart_hashtags'
  , 'set_switch_language'
  , 'set_use_clarifai'
  , 'set_user_interact'
  , 'unfollow_users'
  ]

export const defaultState: State =
  { middle:
    [ { name: '__init__'
      , order: 0
      , value:
        { username: 'HENK!'
        }
      }
    , { name: '__init__'
      , order: 1
      , value:
        { username: 'HENK!'
        }
      }
    , { name: '__init__'
      , order: 2
      , value:
        { username: 'HENK!'
        }
      }
    , { name: '__init__'
      , order: 3
      , value:
        { username: 'HENK!'
        }
      }
    , { name: '__init__'
      , order: 4
      , value:
        { username: 'HENK!'
        }
      }
    ]
  , init: { name: '__init__', deletable: false }
  , end: { name: 'end', deletable: false }
  , addButton:
    { pickList: dynamicMethods
    }
  }

export type Reducer = (prev: State) => State | undefined

const initReducer = (defaultState:any) =>
  (prev:any) => ({...defaultState, ...prev})

export type Classes =
  { outer: string
  , inner: string
  , elem: string
  }

export const Style = 
  ( { mainText
    } : ColorPallete
  ) =>
    stylesheet
    ( { outer:
        { fontSize: '1em'
        , color: mainText
        }
      , inner:
        { fontSize: '1em'
        , padding: '.2em'
        }
      , elem:
        { fontSize: '1em'
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

const staticMethods =
  [ '__init__'
  , 'end'
  ]

const rawPick =
  (wantedMethods) => {
    const { args, methods } = raw
    const pickedMethods = pick(wantedMethods, methods)
    return { args, methods: pickedMethods }
  }

export const ConfigInput =
  (colors: ColorPallete) =>
    ({ DOM, onion}: Sources): Sinks => {
      const interfaceApi =
        setupInterface
        ( rawPick([ ...staticMethods, ...dynamicMethods] )
        , method
        , Arg({})
        )

      const init =
        isolate
        ( interfaceApi.__init__
        , 'init'
        )
        ( { DOM, onion } )

      const end =
        isolate
        ( interfaceApi.end
        , 'end'
        )
        ( { DOM, onion } )
      const InstapyMethod = InstapyMethodWrapper(interfaceApi)

      const InstapyMethodList =
        makeCollection
        ( { item: InstapyMethod
          , itemKey: (childState, index) => String(childState.order)
          , itemScope: (key) => key
          , collectSinks:
              (instances) => {
                return (
                  { onion:
                      instances
                        .pickMerge('onion')
                  , DOM:
                      instances
                        .pickCombine('DOM')
                        .map(vNodes => div(vNodes))
                  , up$:
                      instances
                        .pickMerge('up$')
                  , down$:
                      instances
                        .pickMerge('down$')
                  , delete$:
                      instances
                        .pickMerge('delete$')
                  }
                )
              }
          }
        )

      const instapyMethodList =
        isolate
        ( InstapyMethodList
        , 'middle'
        )
        ({DOM, onion})

      const addButton =
        isolate
        ( AddButton(colors)
        , { onion: addButtonLens('middle', 'addButton')
          , '*': 'addButton'
          }
        )
        ({ DOM, onion })

      const action$: Stream<Reducer> =
        intent
        ( DOM
        , instapyMethodList.up$
        , instapyMethodList.down$
        , instapyMethodList.delete$
        )
      const vdom$: Stream<VNode> =
        view
        ( Style(colors)
        , Transitions
        )
        ( onion.state$
        , init.DOM
        , end.DOM
        , instapyMethodList.DOM
        , addButton.DOM
        )

      return { DOM: vdom$
             , onion:
                 xs.merge
                    ( action$
                    , init.onion
                    , end.onion
                    , instapyMethodList.onion
                    , addButton.onion
                    )
             }
    }

const sortOrder =
  compose
  ( iMap((obj, index) => ({ ...obj, order: index }))
  , sort( (a, b) => a.order - b.order)
  )

const arrIndexUpSwitch =
  (index) =>
    (arr) => {
      if (0 >= index || index >= arr.length) {
        return arr
      } else {
        arr[index -1].order = index
        arr[index].order = index - 1
        const newArr = sortOrder(arr)

        return newArr
      }
    }

const arrIndexRemove =
  (index) =>
    (arr) => {
      if (index < 0) {
        return arr
      } else {
        arr[index] = null
        const newArr =
          compose
          ( sortOrder
          , filter(complement(isNil))
          )(arr)

        return newArr
      }
    }

const intent =
  ( DOM: DOMSource
  , up$: Stream<number>
  , down$: Stream<number>
  , delete$: Stream<number>
  ): Stream<Reducer> => {

    const init$ = xs.of<Reducer>(
      initReducer(defaultState)
    )

    const orderUp$ =
      up$
        .map
         ( (index) =>
             (prev) => {
               const newMiddle = arrIndexUpSwitch(index)(prev.middle)

                 return (
                 { ...prev
                 , middle: newMiddle
                 }
               )
             }
         )

    const orderDown$ =
      down$
        .map
         ( (index) =>
             (prev) => {
               const newMiddle = arrIndexUpSwitch(index + 1)(prev.middle)

               return (
                 { ...prev
                 , middle: newMiddle
                 }
               )
             }
         )

    const deleteElemConfig$ =
      delete$
        .map
         ( (index) =>
             (prev) => {
               const newMiddle = arrIndexRemove(index)(prev.middle)

               return (
                 { ...prev
                 , middle: newMiddle
                 }
               )
             }
         )

    return xs.merge(init$, orderUp$, orderDown$, deleteElemConfig$)
  }

const wrapInstapyMethod =
  (instapyMethod, index) =>
    instapyMethod

const view = (css:Classes, trans:Transitions) =>
  ( state$: Stream<State>
  , init$: Stream<VNode>
  , end$: Stream<VNode>
  , instapyMethodList$: Stream<VNode[]>
  , addButton$: Stream<VNode>
  ): Stream<VNode> =>
    xs.combine
       ( state$
       , init$
       , end$
       , instapyMethodList$
       , addButton$
       )
      .map
       ( ( [ {
             }
           , init
           , end
           , instapyMethodList
           , addButton
           ]
         ) =>
           div
           ( `.${css.outer}`
           , { style: trans.outer}
           , [ div
               (`.${css.inner}`
               , { style: trans.inner}
               , [ init
                 // , div(instapyMethodList[0])
                 // , div(map(div, virtualOrder))
                 , instapyMethodList
                 , addButton
                 , end
                 ]
               )
             ]
           )
       )
