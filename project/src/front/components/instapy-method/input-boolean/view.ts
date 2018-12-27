// view
import { Stream } from 'xstream'
import { div
       , h4
       } from '@cycle/dom'
import { State } from './types'
import * as styles from './styles'

import { mustArray } from './../../../utils/must'

const dom =
  ( { name
    , isIncluded
    , value
    }
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
            { [styles.bool]: true
            , [styles.on]: value
            , [styles.hidden]: !isIncluded
            }
          , dataset:
            { flip: true
            }
          }
        , value ? 'True' : 'False'
        )
      ]
    )

const view =
  (state$: Stream<State>) =>
    state$
      .map(dom)

export
  { view
  }
