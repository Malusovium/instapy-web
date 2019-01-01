// view
import xs, { Stream } from 'xstream'
import { div
       , i
       , h4
       } from '@cycle/dom'
import { State } from './types'
import * as styles from './styles'

import { join } from 'rambda'

import { mustArray } from './../../../utils/must'

const dom =
  ( [ { name
      , isIncluded
      }
    , itemNodes
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
      , itemNodes
      , div
        ( `.${styles.addWrapper}`
        , div
          ( { dataset:
              { add: true
              }
            , class:
              { [styles.plus]: true
              }
            }
          , i('.im.im-plus')
          )
        )
      ]
    )

const view =
  (state$: Stream<State>, itemNodes$) =>
    xs.combine(state$, itemNodes$)
      .map(dom)

export
  { view
  }
