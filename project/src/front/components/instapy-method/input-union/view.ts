// view
import xs, { Stream } from 'xstream'
import { div
       , i
       , h4
       } from '@cycle/dom'
import { State } from './types'
import * as styles from './styles'

import
  { dropLast
  , map
  , addIndex
  } from 'rambda'

import { mustArray } from './../../../utils/must'

const iMap = addIndex(map)

const pickList =
  (childComponents) =>
    iMap
    ( (childComponent, index) =>
        div
        ( { class: { [styles.pickWrapper]: true } }
        , [ childComponent
          , div
            ( { class: { [styles.pick]: true }
              , dataset: { pick: `${index}`} 
              }
            )
          ]
        )
    , childComponents
    )

const showOnlyActive =
  (childComponents, active) =>
    iMap
    ( (childComponent, index) =>
        div
        ( { class: { [styles.hidden]: `${active}` !== `${index}` }
          }
        , childComponent
        )
    , childComponents
    )

const dom =
  ( [ { name
      , active
      , pickListOpen
      , isIncluded
      }
    , childComponents
    ]
  ) =>
    div
    ( { class:
        { [styles.container]: true
        }
      }
    , [ ...mustArray
        ( name !== ''
        , div
          ( { dataset: { include: true }
            , class:
              { [styles.name]: true
              , [styles.included]: isIncluded
              }
            }
          , name
          )
        )
      , div
        ( { class:
            { [styles.childWrapper]: true
            , [styles.hidden]: !isIncluded
            }
          }
        , [ div
            ( { class:
                { [styles.hidden]: pickListOpen
                , [styles.open]: true
                }
              , dataset: { pickOpen: true }
              }
            , i('.im.im-angle-up')
            )
          , div
            ( { class:
                { [styles.pickListWrapper]: true
                , [styles.hidden]: !pickListOpen
                }
              }
            , pickList(childComponents)
            )
          , div
            ( { class:
                { [styles.hidden]: pickListOpen
                }
              }
            , showOnlyActive(childComponents, active)
            )
          ]
        )
      ]
    )

const headTailPair =
  ([head, ...tail]:any[]) => [head, tail]

const view =
  (state$: Stream<State>, childComponents) =>
    xs.combine(state$, ...childComponents)
      .map(headTailPair)
      .map(dom)

export
  { view
  }
