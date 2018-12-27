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
    , _default
    }
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
            { [styles.value]: true
            , [styles.hidden]: !isIncluded
            }
          }
        , value
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
