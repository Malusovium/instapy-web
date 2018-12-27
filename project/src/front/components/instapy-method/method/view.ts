// view
import xs, { Stream } from 'xstream'
import { div
       , i
       , VNode
       } from '@cycle/dom'
import { State } from './types'
import * as styles from './styles'

import { mustArray } from './../../../utils/must'

const dom =
  ( [ { name
      , order
      , isOpen
      , deletable
      }
    , childComponents
    ]
  ) =>
    div
    ( { class:
        { [styles.container]: true
        }
      }
    , [ div
        ( { class:
            { [styles.head]: true
            , [styles.isOpen]: !isOpen
            }
          }
        , [ div({ class: { [styles.name]: true } }, name)
          , ...mustArray
            ( isOpen && order > -1
            , div
              ( `.${styles.order}`
              , [ div
                  ( {dataset: { order: 'UP' } }
                  , i('.im.im-arrow-up')
                  )
                , div
                  ( {dataset: { order: 'DOWN'} }
                  , i('.im.im-arrow-down')
                  )
                ]
              )
            )
          , ...mustArray
            ( isOpen && deletable
            , div
              ( { dataset: { delete: true }
                , class: { [styles.cross]:true }
                }
              , i('.im.im-x-mark')
              )
            )
          ]
        )
      , ...mustArray
        ( isOpen
        , div(childComponents)
        )
      , div
        ( { dataset: { openSwitch: true }
          , class:
            { [styles.openSwitch]: true
            , [styles.isClosed]: !isOpen
            , [styles.isOpen]: isOpen
            }
          }
        , i(`.im.im-angle-${isOpen ? 'up' : 'down'}`)
        )
      ]
    )

const headTailPair =
  ([head, ...tail]) => [head, tail]

const view =
  (state$: Stream<State>, childComponentsDOM: Stream<VNode>[]) =>
    xs.combine(state$, ...childComponentsDOM)
      .map(headTailPair)
      .map(dom)

export
  { view
  }
