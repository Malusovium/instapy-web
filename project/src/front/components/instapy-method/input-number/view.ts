// view
import { Stream } from 'xstream'
import { div
       , h4
       , input
       } from '@cycle/dom'
import { State } from './types'
import * as styles from './styles'

import { mustArray } from './../../../utils/must'

const dom =
  ( { name
    , isIncluded
    , value
    , step
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
            { [styles.wrapper]: true
            , [styles.hidden]: !isIncluded
            }
          }
        , [ input
            ( { class:
                { [styles.input]: true
                }
              , props:
                { value: value
                , type: 'number'
                , step: step
                }
              }
            )
          , div( `.${styles.value}`, value)
          ]
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
