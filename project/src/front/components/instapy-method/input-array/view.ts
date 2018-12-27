// view
import { Stream } from 'xstream'
import { div
       , h4
       , textarea
       } from '@cycle/dom'
import { State } from './types'
import * as styles from './styles'

import { join } from 'rambda'

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
      , textarea
        ( { class:
            { [styles.textarea]: true
            , [styles.hidden]: !isIncluded
            }
          , props: { value: value }
          }
        )
      ]
    )

const view =
  (state$: Stream<State>) =>
    state$
      .map
       ( (state) => (
           { ...state
           , value: join(' ', state.value || [])
           }
         )
       )
      .map(dom)

export
  { view
  }
