// index
import { intent } from './intent'
import { view } from './view'

import { State
       , Reducer
       , Sources
       , Sinks
       , Component
       } from './types'

const inputString: Component =
  ({DOM, onion}) => (
    { DOM: view(onion.state$)
    , onion: intent(DOM)
    }
  )

export
  { State
  , inputString
  }
