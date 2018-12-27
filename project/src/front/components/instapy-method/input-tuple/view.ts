// view
import xs, { Stream } from 'xstream'
import { div
       , h4
       } from '@cycle/dom'
import { State } from './types'
import * as styles from './styles'

import { mustArray } from './../../../utils/must'

const dom =
  ( [ { name
      , isIncluded
      }
    , childComponents
    ]
  ) =>
    div
    ( `.${styles.container}`
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
            { [styles.args]: true
            , [styles.hidden]: !isIncluded
            }
          }
        , childComponents
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
